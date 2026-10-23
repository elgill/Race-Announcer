// Windows-only helpers for inspecting Ethernet adapters and switching their IPv4
// configuration between automatic (DHCP) and a manual address for timing boxes.
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const log = require('electron-log');

const POWERSHELL = 'powershell.exe';
const LIST_TIMEOUT_MS = 20000;
// Includes time the user spends looking at the UAC prompt.
const APPLY_TIMEOUT_MS = 120000;

// Descriptions that indicate a software adapter even when Windows reports it as hardware.
const VIRTUAL_ADAPTER_PATTERN = /virtual|hyper-v|vmware|virtualbox|vbox|vpn|tap-|\btap\b|wintun|wireguard|tailscale|zerotier|openvpn|tunnel|loopback|npcap|anyconnect|globalprotect|pangp|fortinet|forticlient|juniper|pulse secure|zscaler|nordlynx|docker|wsl|miniport|bluetooth/i;

const TCPIP_INTERFACES_KEY = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces';

// Switching an unplugged adapter to manual leaves the live DHCP flag "Enabled" and only
// records DisableDhcpOnConnect=1 in the registry until a cable connects. The Windows
// properties dialog reads the registry, so we do too.
const LIST_SCRIPT = `
$ErrorActionPreference = 'Stop'
$result = @(Get-NetAdapter | Where-Object { $_.Status -ne 'Not Present' } | ForEach-Object {
  $a = $_
  $ipIf = Get-NetIPInterface -InterfaceIndex $a.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
  $reg = Get-ItemProperty -Path "${TCPIP_INTERFACES_KEY}\\$($a.InterfaceGuid)" -ErrorAction SilentlyContinue
  $isManual = ($ipIf -and $ipIf.Dhcp -eq 'Disabled') -or ($reg -and ($reg.EnableDHCP -eq 0 -or $reg.DisableDhcpOnConnect -eq 1))
  if ($isManual) {
    $addrs = @(Get-NetIPAddress -InterfaceIndex $a.ifIndex -AddressFamily IPv4 -PolicyStore PersistentStore -ErrorAction SilentlyContinue | Where-Object { $_.PrefixOrigin -eq 'Manual' })
  }
  if (-not $isManual -or $addrs.Count -eq 0) {
    $addrs = @(Get-NetIPAddress -InterfaceIndex $a.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue)
  }
  [pscustomobject]@{
    ifIndex = [int]$a.ifIndex
    name = [string]$a.Name
    description = [string]$a.InterfaceDescription
    status = [string]$a.Status
    hardwareInterface = [bool]$a.HardwareInterface
    physicalMediaType = [string]$a.PhysicalMediaType
    dhcp = if ($isManual) { 'Disabled' } elseif ($ipIf) { [string]$ipIf.Dhcp } else { $null }
    addresses = @($addrs | ForEach-Object { [pscustomobject]@{ ip = [string]$_.IPAddress; prefixLength = [int]$_.PrefixLength } })
  }
})
ConvertTo-Json -InputObject $result -Depth 4 -Compress
`;

function isSupported() {
  return process.platform === 'win32';
}

function encodeCommand(script) {
  return Buffer.from(script, 'utf16le').toString('base64');
}

function runPowerShell(script, timeout) {
  return new Promise((resolve, reject) => {
    execFile(
      POWERSHELL,
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodeCommand(script)],
      { timeout, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout;
          err.stderr = stderr;
          reject(err);
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

function classifyAdapter(raw) {
  const looksVirtual = !raw.hardwareInterface || VIRTUAL_ADAPTER_PATTERN.test(raw.description) || VIRTUAL_ADAPTER_PATTERN.test(raw.name);
  if (looksVirtual) {
    return 'virtual';
  }
  if (raw.physicalMediaType === '802.3') {
    return 'wired';
  }
  if (/802\.11|wireless/i.test(raw.physicalMediaType)) {
    return 'wireless';
  }
  return 'other';
}

function toIpv4Mode(dhcp) {
  if (dhcp === 'Enabled') {
    return 'automatic';
  }
  if (dhcp === 'Disabled') {
    return 'manual';
  }
  return 'unknown';
}

async function listAdapters() {
  if (!isSupported()) {
    return { supported: false, adapters: [] };
  }
  const stdout = await runPowerShell(LIST_SCRIPT, LIST_TIMEOUT_MS);
  const parsed = JSON.parse(stdout.trim() || '[]');
  const adapters = (Array.isArray(parsed) ? parsed : [parsed]).map(raw => ({
    ifIndex: raw.ifIndex,
    name: raw.name,
    description: raw.description,
    status: raw.status,
    kind: classifyAdapter(raw),
    ipv4Mode: toIpv4Mode(raw.dhcp),
    addresses: raw.addresses || []
  }));
  return { supported: true, adapters };
}

function assertIfIndex(ifIndex) {
  if (!Number.isInteger(ifIndex) || ifIndex <= 0) {
    throw new Error(`Invalid interface index: ${ifIndex}`);
  }
}

function assertIpv4(ip) {
  const parts = typeof ip === 'string' ? ip.split('.') : [];
  const valid = parts.length === 4 && parts.every(p => /^\d{1,3}$/.test(p) && Number(p) <= 255);
  if (!valid) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
}

function prefixToMask(prefixLength) {
  const bits = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  return [24, 16, 8, 0].map(shift => (bits >>> shift) & 0xff).join('.');
}

function psQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Runs a script elevated (one UAC prompt). Elevated processes can't share our
// stdout, so the script reports errors through a result file.
async function runElevated(body) {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'race-announcer-net-'));
  const resultPath = path.join(dir, 'result.txt');
  const script = `
$ErrorActionPreference = 'Stop'
$resultPath = ${psQuote(resultPath)}
try {
${body}
  Set-Content -Path $resultPath -Value 'ok'
} catch {
  Set-Content -Path $resultPath -Value $_.Exception.Message
  exit 1
}
`;
  const launcher = `
$ErrorActionPreference = 'Stop'
$p = Start-Process -FilePath ${psQuote(POWERSHELL)} -Verb RunAs -WindowStyle Hidden -Wait -PassThru -ArgumentList ${psQuote(`-NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ${encodeCommand(script)}`)}
exit $p.ExitCode
`;
  try {
    await runPowerShell(launcher, APPLY_TIMEOUT_MS);
    const result = (await fs.promises.readFile(resultPath, 'utf8').catch(() => '')).trim();
    if (result !== 'ok') {
      throw new Error(result || 'The network change did not complete.');
    }
  } catch (err) {
    if (/cancel+ed by the user/i.test(err.stderr || '')) {
      throw new Error('Administrator permission was declined, so the network settings were not changed.');
    }
    const result = (await fs.promises.readFile(resultPath, 'utf8').catch(() => '')).trim();
    if (result && result !== 'ok') {
      throw new Error(result);
    }
    throw err;
  } finally {
    fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function netshStep(args) {
  return `
  $out = & netsh.exe ${args} 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { throw ("netsh: " + $out.Trim()) }`;
}

async function setStaticAddress({ ifIndex, ip, prefixLength }) {
  if (!isSupported()) {
    throw new Error('Network setup is only supported on Windows.');
  }
  assertIfIndex(ifIndex);
  assertIpv4(ip);
  if (!Number.isInteger(prefixLength) || prefixLength < 8 || prefixLength > 30) {
    throw new Error(`Invalid prefix length: ${prefixLength}`);
  }
  log.info('Network setup: setting manual IPv4 address', { ifIndex, ip, prefixLength });
  // No gateway, so internet keeps going over Wi-Fi. A low interface metric makes
  // Windows prefer this adapter when another one is on the same subnet.
  await runElevated(`
${netshStep(`interface ipv4 set address name=${ifIndex} source=static address=${ip} mask=${prefixToMask(prefixLength)} gateway=none`)}
  Set-NetIPInterface -InterfaceIndex ${ifIndex} -AddressFamily IPv4 -InterfaceMetric 5`);
}

async function setAutomatic({ ifIndex }) {
  if (!isSupported()) {
    throw new Error('Network setup is only supported on Windows.');
  }
  assertIfIndex(ifIndex);
  log.info('Network setup: switching IPv4 to automatic (DHCP)', { ifIndex });
  // On an unplugged adapter the pending manual config lives only in the persistent store
  // and registry, and netsh may just say "DHCP is already enabled". So netsh's result is
  // ignored, leftovers are cleared directly, and the end state is verified.
  await runElevated(`
  $regKey = "${TCPIP_INTERFACES_KEY}\\$((Get-NetAdapter -InterfaceIndex ${ifIndex}).InterfaceGuid)"
  & netsh.exe interface ipv4 set address name=${ifIndex} source=dhcp | Out-Null
  foreach ($store in 'PersistentStore', 'ActiveStore') {
    Get-NetIPAddress -InterfaceIndex ${ifIndex} -AddressFamily IPv4 -PolicyStore $store -ErrorAction SilentlyContinue |
      Where-Object { $_.PrefixOrigin -eq 'Manual' } |
      Remove-NetIPAddress -Confirm:$false -ErrorAction SilentlyContinue
  }
  Set-NetIPInterface -InterfaceIndex ${ifIndex} -AddressFamily IPv4 -Dhcp Enabled
  Remove-ItemProperty -Path $regKey -Name DisableDhcpOnConnect -ErrorAction SilentlyContinue
  & netsh.exe interface ipv4 set dnsservers name=${ifIndex} source=dhcp | Out-Null
  Set-NetIPInterface -InterfaceIndex ${ifIndex} -AddressFamily IPv4 -AutomaticMetric Enabled
  $leftover = @(Get-NetIPAddress -InterfaceIndex ${ifIndex} -AddressFamily IPv4 -PolicyStore PersistentStore -ErrorAction SilentlyContinue | Where-Object { $_.PrefixOrigin -eq 'Manual' })
  $reg = Get-ItemProperty -Path $regKey -ErrorAction SilentlyContinue
  if ($leftover.Count -gt 0 -or ($reg -and ($reg.EnableDHCP -eq 0 -or $reg.DisableDhcpOnConnect -eq 1))) {
    throw 'Windows did not switch the adapter back to automatic. Try again, or change it in Network Connections.'
  }`);
}

module.exports = { listAdapters, setStaticAddress, setAutomatic };
