const { app, BrowserWindow, ipcMain, Menu, powerMonitor, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const net = require('net');

log.initialize();

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception', err);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled promise rejection', reason);
});

log.info('=== Race Announcer starting ===', { version: app.getVersion(), electron: process.versions.electron, platform: process.platform });

let win;
// Map of matId -> TCP socket client
const timingBoxClients = new Map();

const CONNECT_TIMEOUT_MS = 8000;

function sendToRenderer(channel, data) {
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data);
  }
}

const WINDOW_CONFIG = {
  width: 1200,
  height: 800,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
  icon: __dirname + '/dist/race-announcer-angular/favicon.ico'
};

function createWindow () {
  log.info('Creating main window');
  win = new BrowserWindow(WINDOW_CONFIG)
  win.loadFile('dist/race-announcer-angular/browser/index.html')

  win.webContents.on('did-finish-load', () => {
    log.info('Renderer finished loading');
  });

  win.on('closed', () => {
    log.info('Main window closed');
    win = null
  })

  setupIPCListeners();
  setupAutoUpdater();
  setupPowerMonitor();

  //win.webContents.openDevTools();
}

app.on('ready', () => {
  log.info('App ready');
  createWindow();
});

app.on('window-all-closed', () => {
  log.info('All windows closed — quitting');
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    log.info('App activated with no window — recreating');
    createWindow();
  }
});

function setupPowerMonitor() {
  powerMonitor.on('suspend', () => {
    log.info('System suspending');
  });

  powerMonitor.on('resume', () => {
    log.info('System resumed from sleep — tearing down timing box connections', { count: timingBoxClients.size });
    timingBoxClients.forEach((client, matId) => {
      timingBoxClients.delete(matId);
      client.destroy();
      sendToRenderer('timing-box-status', { matId, status: 'Disconnected' });
    });
  });
}

function setupIPCListeners() {
  ipcMain.on('connect-timing-box', (event, { matId, ip, port, label }) => {
    log.info('IPC: connect-timing-box', { matId, ip, port, label });
    connectToTimingBox(matId, ip, port, label);
  });

  ipcMain.on('disconnect-timing-box', (event, { matId }) => {
    log.info('IPC: disconnect-timing-box', { matId });
    const client = timingBoxClients.get(matId);
    if (client) {
      timingBoxClients.delete(matId);
      client.destroy();
      sendToRenderer('timing-box-status', { matId, status: 'Disconnected' });
    } else {
      log.warn('IPC: disconnect-timing-box — no client found', { matId });
    }
  });

  ipcMain.on('disconnect-all-timing-boxes', () => {
    log.info('IPC: disconnect-all-timing-boxes', { count: timingBoxClients.size });
    timingBoxClients.forEach((client, matId) => {
      timingBoxClients.delete(matId);
      client.destroy();
      sendToRenderer('timing-box-status', { matId, status: 'Disconnected' });
    });
  });

  ipcMain.on('get-timing-box-states', (event) => {
    log.info('IPC: get-timing-box-states', { connected: [...timingBoxClients.keys()] });
    timingBoxClients.forEach((client, matId) => {
      event.sender.send('timing-box-status', { matId, status: 'Connected' });
    });
  });

  ipcMain.on('install-update', () => {
    log.info('IPC: install-update — calling quitAndInstall');
    autoUpdater.quitAndInstall();
  });
}

function setupAutoUpdater() {
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'debug';

  log.info('Auto-updater: checking for updates');
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('checking-for-update', () => {
    log.info('Auto-updater: checking-for-update');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Auto-updater: update-available', info);
    sendToRenderer('update-available');
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Auto-updater: update-not-available', info);
  });

  autoUpdater.on('download-progress', (progress) => {
    log.info('Auto-updater: download-progress', {
      percent: Math.round(progress.percent),
      transferred: progress.transferred,
      total: progress.total,
      bytesPerSecond: Math.round(progress.bytesPerSecond)
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Auto-updater: update-downloaded', info);
    sendToRenderer('update-downloaded');
  });

  autoUpdater.on('error', (err) => {
    log.error('Auto-updater: error', err);
  });
}

function connectToTimingBox(matId, ip, port, label) {
  // Remove any existing socket first. Delete from map before destroying so its
  // close event identity check won't fire a spurious status update.
  const existingClient = timingBoxClients.get(matId);
  if (existingClient) {
    timingBoxClients.delete(matId);
    existingClient.destroy();
  }

  const client = new net.Socket();
  timingBoxClients.set(matId, client);

  // TCP keepalive detects silently dead connections (e.g. after sleep/wake or NAT timeout).
  client.setKeepAlive(true, 5000);
  // Timeout fires if the socket is idle during connect; destroyed below to trigger close.
  client.setTimeout(CONNECT_TIMEOUT_MS);

  client.connect(port, ip, () => {
    client.setTimeout(0);
    log.info(`Timing mat connected`, { matId, label, ip, port });
    sendToRenderer('timing-box-status', { matId, status: 'Connected' });

    if (port === 3601) {
      client.write('SETPROTOCOL;2.6\r\n');
      client.write('SETPUSHPASSINGS;1;0\r\n');
    }
  });

  client.on('timeout', () => {
    log.warn('Timing mat connect timeout', { matId, label, ip, port });
    client.destroy();
  });

  client.on('data', (data) => {
    const records = data.toString('utf-8').split('\r\n');
    records.forEach(record => {
      if (record.trim() !== '') {
        log.debug('Timing mat data', { matId, label, record });
        sendToRenderer('timing-box-data', { matId, data: record });
      }
    });
  });

  client.on('close', () => {
    if (timingBoxClients.get(matId) === client) {
      log.info('Timing mat connection closed', { matId, label });
      timingBoxClients.delete(matId);
      sendToRenderer('timing-box-status', { matId, status: 'Disconnected' });
    }
  });

  client.on('error', (err) => {
    log.error('Timing mat error', { matId, label, message: err.message, code: err.code });
    if (timingBoxClients.get(matId) === client) {
      timingBoxClients.delete(matId);
      sendToRenderer('timing-box-status', { matId, status: 'Error', message: err.message });
    }
  });
}


const template = [
  {
    label: 'File',
    submenu: [
       {
        label: 'Import / Export',
        click() { win.webContents.send('menu-clicked', '/importexport'); }
      },
      { type: "separator" },
      {
        label: 'Settings',
        click() { win.webContents.send('menu-clicked', '/settings'); }
      },
      { type: "separator" },
      {
        label: 'Exit',
        click() { app.quit() }
      }
    ]
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Browse',
        click() { win.webContents.send('menu-clicked', '/browse'); }
      },
    ]
  },
  {
    label: 'Reports',
    submenu: [
      {
        label: 'Timer Report',
        click() { win.webContents.send('report-menu-clicked', 'timer'); }
      },
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Open Logs Folder',
        click() { shell.openPath(app.getPath('logs')); }
      },
      { type: 'separator' },
      {
        label: 'Developer Tools',
        click() { win.webContents.openDevTools(); }
      },
    ]
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

