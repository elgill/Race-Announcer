const { app, BrowserWindow, ipcMain, Menu, powerMonitor } = require('electron');
const { autoUpdater } = require('electron-updater');
const net = require('net');

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
    worldSafeExecuteJavaScript: true
  },
  icon: __dirname + '/dist/race-announcer-angular/favicon.ico'
};

function createWindow () {
  win = new BrowserWindow(WINDOW_CONFIG)
  win.loadFile('dist/race-announcer-angular/browser/index.html')

  win.on('closed', () => {
    win = null
  })

  setupIPCListeners();
  setupAutoUpdater();
  setupPowerMonitor();

  //win.webContents.openDevTools();
}

app.on('ready', createWindow)

app.on('window-all-closed', app.quit)

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function setupPowerMonitor() {
  powerMonitor.on('resume', () => {
    console.log('System resumed from sleep — tearing down timing box connections');
    timingBoxClients.forEach((client, matId) => {
      timingBoxClients.delete(matId);
      client.destroy();
      // Send Disconnected explicitly since the identity check in the close handler
      // will skip it (client was already removed from the map above).
      sendToRenderer('timing-box-status', { matId, status: 'Disconnected' });
    });
  });
}

function setupIPCListeners() {
  // Connect to a single timing mat
  ipcMain.on('connect-timing-box', (event, { matId, ip, port, label }) => {
    connectToTimingBox(matId, ip, port, label);
  });

  // Disconnect from a single timing mat
  ipcMain.on('disconnect-timing-box', (event, { matId }) => {
    const client = timingBoxClients.get(matId);
    if (client) {
      // Remove from map first so the close event identity check won't double-send status.
      timingBoxClients.delete(matId);
      client.destroy();
      sendToRenderer('timing-box-status', { matId, status: 'Disconnected' });
    }
  });

  // Disconnect from all timing mats
  ipcMain.on('disconnect-all-timing-boxes', () => {
    timingBoxClients.forEach((client, matId) => {
      timingBoxClients.delete(matId);
      client.destroy();
      sendToRenderer('timing-box-status', { matId, status: 'Disconnected' });
    });
  });

  // Renderer requests current connection state on init (handles crash/reload recovery)
  ipcMain.on('get-timing-box-states', (event) => {
    timingBoxClients.forEach((client, matId) => {
      event.sender.send('timing-box-status', { matId, status: 'Connected' });
    });
  });

  // Install downloaded update and restart
  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });
}

function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    sendToRenderer('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    sendToRenderer('update-downloaded');
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
    // Disable idle timeout once connected — keepalive handles dead detection from here.
    client.setTimeout(0);
    console.log(`Connected to timing mat ${matId} (${label}) at ${ip}:${port}`);
    sendToRenderer('timing-box-status', { matId, status: 'Connected' });

    if (port === 3601) {
      client.write('SETPROTOCOL;2.6\r\n');
      client.write('SETPUSHPASSINGS;1;0\r\n');
    }
  });

  client.on('timeout', () => {
    console.log(`Connect timeout for timing mat ${matId} (${label})`);
    client.destroy(); // triggers close event below
  });

  client.on('data', (data) => {
    const records = data.toString('utf-8').split('\r\n');
    records.forEach(record => {
      if (record.trim() !== '') {
        console.log(`Data from ${matId} (${label}):`, record);
        sendToRenderer('timing-box-data', { matId, data: record });
      }
    });
  });

  // Identity check: only act if this is still the active socket for this mat.
  // Prevents a destroyed old socket from clobbering a new socket's map entry.
  client.on('close', () => {
    if (timingBoxClients.get(matId) === client) {
      console.log(`Connection to timing mat ${matId} (${label}) closed`);
      timingBoxClients.delete(matId);
      sendToRenderer('timing-box-status', { matId, status: 'Disconnected' });
    }
  });

  client.on('error', (err) => {
    console.error(`Error on timing mat ${matId} (${label}):`, err.message);
    if (timingBoxClients.get(matId) === client) {
      timingBoxClients.delete(matId);
      sendToRenderer('timing-box-status', { matId, status: 'Error', message: err.message });
    }
    // Node.js always fires close after error; identity check above prevents double-status.
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
        label: 'Developer Tools',
        click() { win.webContents.openDevTools(); }
      },
    ]
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

