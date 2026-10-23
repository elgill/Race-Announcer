// End-to-end smoke test: drives the real Electron app over the Chrome DevTools Protocol with a
// throwaway profile (your real settings and runner data are never touched) and a fake Trident
// timing box on localhost. Run with `npm run e2e`, which builds the Angular app first.
const path = require('path');
const fs = require('fs');
const os = require('os');
const net = require('net');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const ELECTRON = require('electron');

const APP_DIR = path.join(__dirname, '..');
const WORK_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'race-announcer-e2e-'));
const PROFILE_DIR = path.join(WORK_DIR, 'profile');
const DOWNLOAD_DIR = path.join(WORK_DIR, 'downloads');
const CSV_PATH = path.join(WORK_DIR, 'runners.csv');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const consoleErrors = [];

// --- Fake Trident timing box -------------------------------------------------
let boxSocket = null;
const box = net.createServer(socket => { boxSocket = socket; });
function tridentRead(chip) {
  // aa + reader + receiver + 12-char tag + counter + yymmdd + hhmmss + hundredths + padding + type = 38 chars
  return `aa01${chip}0001261023120000000001`;
}

// --- CDP helpers -------------------------------------------------------------
let ws; let msgId = 0; const pending = new Map();
function send(method, params = {}) {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
  }
  return res.result.value;
}
async function waitFor(expression, timeout = 5000) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeout) {
    try { last = await evaluate(expression); if (last) return last; } catch (e) { last = e.message; }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for: ${expression} (last: ${JSON.stringify(last)})`);
}
const text = sel => evaluate(`document.querySelector(${JSON.stringify(sel)})?.textContent ?? null`);
const bodyText = () => evaluate('document.body.innerText');
const click = sel => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) throw new Error('no element ${sel}'); el.click(); return true; })()`);
const clickButton = (label, scope = 'body') => evaluate(`(() => {
  const btn = [...document.querySelectorAll(${JSON.stringify(scope + ' button')})].find(b => b.textContent.trim() === ${JSON.stringify(label)});
  if (!btn) throw new Error('no button ${label}'); btn.click(); return true; })()`);
const setValue = (sel, value, event = 'input') => evaluate(`(() => {
  const el = document.querySelector(${JSON.stringify(sel)}); if (!el) throw new Error('no element ${sel}');
  el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event(${JSON.stringify(event)}, { bubbles: true })); return true; })()`);
// Mimic the main process sending an IPC message to the renderer
const ipcEmit = (channel, ...args) => evaluate(`require('electron').ipcRenderer.emit(${JSON.stringify(channel)}, {}, ...${JSON.stringify(args)}); true`);
// Settle briefly after routing: ngModel writes its initial value a microtask after the view renders
const navigate = async (route, marker) => { await ipcEmit('menu-clicked', route); await waitFor(`document.body.innerText.includes(${JSON.stringify(marker)})`); await sleep(150); };
async function pressKey(key, code, keyCode) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, text: key.length === 1 ? key : undefined });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode });
}
async function step(name, fn) {
  try { await fn(); results.push(['PASS', name]); console.log('PASS', name); }
  catch (e) {
    results.push(['FAIL', name, e.message]); console.log('FAIL', name, '-', e.message);
    console.log('  page text:', JSON.stringify((await bodyText().catch(() => '')).slice(0, 600)));
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

function freePort() {
  return new Promise(resolve => {
    const probe = net.createServer().listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

let app;
function cleanup() {
  app?.kill();
  box.close();
  // Electron can hold profile files briefly after exit
  fs.rmSync(WORK_DIR, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}

(async () => {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  fs.writeFileSync(CSV_PATH, [
    'Bib,First Name,Last Name,Age,Gender,Town,State',
    ...Array.from({ length: 10 }, (_, i) => `${101 + i},Runner${101 + i},Tester,${20 + i},F,Springfield,MA`)
  ].join('\n'));

  await new Promise(r => box.listen(0, '127.0.0.1', r));
  const boxPort = box.address().port;

  const cdpPort = await freePort();
  app = spawn(ELECTRON, [APP_DIR, `--user-data-dir=${PROFILE_DIR}`, `--remote-debugging-port=${cdpPort}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  const appLog = [];
  app.stdout.on('data', d => appLog.push(d.toString()));
  app.stderr.on('data', d => appLog.push(d.toString()));

  let target;
  for (let i = 0; i < 100 && !target; i++) {
    await sleep(200);
    try { target = (await (await fetch(`http://127.0.0.1:${cdpPort}/json`)).json()).find(t => t.type === 'page'); } catch {}
  }
  if (!target) throw new Error('Electron did not expose a DevTools page. Did `ng build` run?');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  ws.on('message', raw => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map(a => a.value ?? a.description).join(' '));
    }
  });
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOAD_DIR }).catch(() => {});

  await waitFor(`!!document.querySelector('app-announce')`, 15000);

  await step('uses an isolated profile (no saved settings)', async () => {
    assert(await evaluate(`localStorage.getItem('settings') === null`), 'found existing settings - profile is not isolated!');
  });

  await step('announce: manual bib entry shows a row', async () => {
    await setValue('app-bib-entry input', '555');
    await evaluate(`document.querySelector('app-bib-entry form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); true`);
    await waitFor(`document.querySelector('app-announce-freeform').innerText.includes('555')`);
    assert((await evaluate(`document.querySelector('app-bib-entry input').value`)) === '', 'input not cleared');
  });

  await step('announce: Delete key removes the last entry', async () => {
    await evaluate(`document.querySelector('app-bib-entry input').focus(); true`);
    await pressKey('Delete', 'Delete', 46);
    await waitFor(`!document.querySelector('app-announce-freeform').innerText.includes('555')`);
  });

  await step('menu navigation from main process (IPC) changes route', async () => {
    await navigate('/xref', 'Add Batch XREF Data');
  });

  await step('xref: create batch updates ranges table and count', async () => {
    await setValue('#startingBibNumber', '101');
    await setValue('#startingChipCode', '101');
    await setValue('#numberOfEntries', '10');
    await clickButton('Create');
    await waitFor(`document.body.innerText.includes('Creation successful!')`);
    await waitFor(`document.querySelector('app-show-xref').innerText.includes('101 – 110')`);
    const summary = await text('.xref-summary');
    assert(/10 chips in\s+1 range/.test(summary), `summary was "${summary}"`);
  });

  await step('import: CSV upload shows mapping, then imports', async () => {
    await navigate('/importexport', 'Import Runners');
    const { root } = await send('DOM.getDocument');
    const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: 'app-csv-import input[type=file]' });
    await send('DOM.setFileInputFiles', { nodeId, files: [CSV_PATH] });
    await waitFor(`document.body.innerText.includes('Column Mapping')`);
    await clickButton('Import', 'app-csv-import');
    await waitFor(`document.body.innerText.includes('Import successful!')`);
  });

  await step('browse: lists imported runners and filters', async () => {
    await navigate('/browse', 'runners');
    await waitFor(`document.querySelector('.count')?.textContent.includes('10 of 10 runners')`);
    await setValue('.toolbar input', 'Runner105');
    await waitFor(`document.querySelector('.count').textContent.includes('1 of 10 runners')`);
  });

  await step('browse: edit a runner and save', async () => {
    await click('app-runner-table tbody tr');
    await waitFor(`document.querySelector('app-runner-editor h3')?.textContent.includes('Edit Runner 105')`);
    await setValue('app-runner-editor input[name=firstName]', 'Edited');
    await clickButton('Save', 'app-runner-editor');
    await waitFor(`document.body.innerText.includes('Saved runner 105.')`);
    await setValue('.toolbar input', '');
    await waitFor(`document.querySelector('app-runner-table').innerText.includes('Edited')`);
    assert(!(await evaluate(`!!document.querySelector('app-runner-editor')`)), 'editor still open');
  });

  await step('name lookup: async search shows results', async () => {
    await navigate('/lookup', 'First name');
    await setValue('#lastName', 'Tester');
    await waitFor(`document.querySelectorAll('app-runner-table tbody tr').length === 10`);
  });

  await step('settings: add a timing mat via dialog (auto-saves)', async () => {
    await navigate('/settings', 'Race Settings');
    await clickButton('Add Mat');
    await waitFor(`!!document.querySelector('.dialog #matLabel')`);
    await setValue('#matLabel', 'Fake Box');
    await setValue('#matIp', '127.0.0.1');
    await evaluate(`[...document.querySelectorAll('.dialog .type-option')].find(l => l.textContent.trim() === 'Other').querySelector('input').click(); true`);
    await setValue('#matPort', String(boxPort));
    await clickButton('Save', '.dialog');
    await waitFor(`document.querySelector('app-mat-connections-editor').innerText.includes('127.0.0.1:${boxPort}')`);
    await waitFor(`(JSON.parse(localStorage.getItem('settings') || '{}').matConnections || []).some(m => m.port === ${boxPort})`, 4000);
  });

  await step('settings: race start time and template auto-save', async () => {
    const start = new Date(Date.now() - 65 * 60 * 1000);
    const pad = n => String(n).padStart(2, '0');
    const local = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T${pad(start.getHours())}:${pad(start.getMinutes())}:${pad(start.getSeconds())}`;
    await setValue('input[formControlName=raceStartTime]', local);
    await waitFor(`!!JSON.parse(localStorage.getItem('settings') || '{}').raceStartTime`, 4000);
  });

  await step('announce: race clock ticks', async () => {
    await navigate('/announce', 'Del Last Runner');
    const t1 = await text('.race-clock');
    assert(/^1:0[45]:/.test(t1.trim()) || t1.includes('1:05') || t1.includes('1:04'), `clock was "${t1}"`);
    await sleep(300);
    const t2 = await text('.race-clock');
    assert(t1 !== t2, `clock did not tick: ${t1}`);
  });

  await step('announce: connect to mat updates status badge (real TCP + IPC)', async () => {
    await waitFor(`document.querySelector('.status-badge')?.textContent.includes('Disconnected')`);
    await click('.mat-action');
    await waitFor(`document.querySelector('.status-badge').textContent.includes('Connected') && !document.querySelector('.status-badge').textContent.includes('Dis')`);
    assert((await text('.mat-action')).includes('Disconnect'), 'button did not switch to Disconnect');
  });

  await step('announce: chip read from timing box shows the runner', async () => {
    boxSocket.write(tridentRead('000000000101') + '\r\n');
    await waitFor(`document.querySelector('app-announce-freeform').innerText.includes('Runner101')`);
  });

  await step('announce: pause queues reads, unpause releases them', async () => {
    await evaluate(`document.querySelector('app-bib-entry input').focus(); true`);
    await pressKey(' ', 'Space', 32);
    await waitFor(`document.querySelector('.pause-status').innerText.includes('Paused: 0 entries in queue')`);
    boxSocket.write(tridentRead('000000000102') + '\r\n');
    await waitFor(`document.querySelector('.pause-status').innerText.includes('Paused: 1 entries in queue')`);
    assert(!(await evaluate(`document.querySelector('app-announce-freeform').innerText.includes('Runner102')`)), 'paused read was shown');
    await pressKey(' ', 'Space', 32);
    await waitFor(`document.querySelector('app-announce-freeform').innerText.includes('Runner102')`);
    await waitFor(`document.querySelector('.pause-status').innerText.trim() === ''`);
  });

  await step('announce: duplicate read within min time is suppressed', async () => {
    const before = await evaluate(`document.querySelectorAll('app-announce-freeform > div > div').length`);
    boxSocket.write(tridentRead('000000000101') + '\r\n');
    await sleep(500);
    const after = await evaluate(`document.querySelectorAll('app-announce-freeform > div > div').length`);
    assert(before === after, `rows went ${before} -> ${after}`);
  });

  for (const [template, selector, marker] of [
    ['grid', 'app-announce-grid', 'Runner102'],
    ['timer', 'app-announce-timer', 'Runner102'],
    ['recency', 'app-announce-recency', 'Runner102'],
  ]) {
    await step(`announce: ${template} template renders entries`, async () => {
      await navigate('/settings', 'Display Settings');
      await setValue('select[formControlName=announceTemplate]', template, 'change');
      await waitFor(`JSON.parse(localStorage.getItem('settings')).announceTemplate === '${template}'`, 4000);
      await navigate('/announce', 'Del Last Runner');
      await waitFor(`document.querySelector('${selector}')?.innerText.includes('${marker}')`);
      if (template === 'timer') {
        await waitFor(`/1:0\\d:/.test(document.querySelector('app-announce-timer tbody').innerText)`);
      }
    });
  }

  await step('announce (recency): new read gets an animated time badge', async () => {
    boxSocket.write(tridentRead('000000000103') + '\r\n');
    await waitFor(`!!document.querySelector('app-announce-recency .time-badge')`);
    const b1 = await text('app-announce-recency .time-badge');
    await sleep(400);
    const b2 = await text('app-announce-recency .time-badge');
    assert(b1 !== b2, `badge did not update: ${b1}`);
  });

  await step('announce: timing box dropping the connection updates the badge', async () => {
    boxSocket.destroy();
    await waitFor(`/Reconnecting|Disconnected|Connecting/.test(document.querySelector('.status-badge').textContent)`);
    await click('.mat-action'); // stop reconnecting
    await waitFor(`document.querySelector('.status-badge').textContent.includes('Disconnected')`);
  });

  await step('update banner reacts to updater IPC', async () => {
    await ipcEmit('update-available', { version: '9.9.9' });
    await ipcEmit('update-progress', { percent: 37.6 });
    await waitFor(`document.querySelector('.update-banner')?.innerText.includes('38%')`);
    await ipcEmit('update-downloaded', {});
    await waitFor(`document.querySelector('.update-banner.ready')?.innerText.includes('Version 9.9.9')`);
    await clickButton('Later');
    await waitFor(`!document.querySelector('.update-banner')`);
  });

  await step('bib history shows attempts including blocked duplicate', async () => {
    await navigate('/bib-history', 'Bib Entry History');
    await setValue('#bibSearch', '101');
    await click('.search-button');
    await waitFor(`document.body.innerText.includes('Total attempts: 2')`);
    assert((await bodyText()).includes('Blocked: 1'), 'expected one blocked attempt');
  });

  await step('timer report PDF (jspdf 4) is generated', async () => {
    await ipcEmit('report-menu-clicked', 'timer');
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && !fs.readdirSync(DOWNLOAD_DIR).some(f => f.endsWith('.pdf'))) await sleep(200);
    const pdf = fs.readdirSync(DOWNLOAD_DIR).find(f => f.endsWith('.pdf'));
    assert(pdf, 'no PDF downloaded');
    const head = fs.readFileSync(path.join(DOWNLOAD_DIR, pdf)).subarray(0, 5).toString();
    assert(head === '%PDF-', `not a PDF: ${head}`);
  });

  await step('quick setup: runner info counts and clear status timeout', async () => {
    await navigate('/quick-setup', 'Quick Setup');
    await waitFor(`document.querySelector('app-runner-info').innerText.includes('Current Runners: 10')`);
    assert((await text('app-runner-info')).includes('XREF Entries: 10'), 'xref count wrong');
    await click('.btn-info');
    await waitFor(`document.body.innerText.includes('Active Entries Cleared!')`);
    await waitFor(`!document.body.innerText.includes('Active Entries Cleared!')`, 5000);
    await clickButton('Clear Runners Database');
    await waitFor(`document.querySelector('app-runner-info').innerText.includes('Current Runners: 0')`);
  });

  await step('no uncaught errors in the renderer', async () => {
    assert(consoleErrors.length === 0, consoleErrors.join('\n'));
  });

  ws.close();
  cleanup();
  const failed = results.filter(r => r[0] === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log('--- app log tail ---\n' + appLog.join('').split('\n').slice(-30).join('\n'));
  }
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); cleanup(); process.exit(2); });
