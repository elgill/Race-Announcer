const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const net = require('net');

let win;
// Map of matId -> TCP socket client
const timingBoxClients = new Map();

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

  //win.webContents.openDevTools();
}

app.on('ready', createWindow)

app.on('window-all-closed', app.quit)

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function setupIPCListeners() {
  // Connect to a single timing mat
  ipcMain.on('connect-timing-box', (event, { matId, ip, port, label }) => {
    connectToTimingBox(matId, ip, port, label);
  });

  // Disconnect from a single timing mat
  ipcMain.on('disconnect-timing-box', (event, { matId }) => {
    const client = timingBoxClients.get(matId);
    if (client) {
      client.destroy();
      timingBoxClients.delete(matId);
    }
  });

  // Disconnect from all timing mats
  ipcMain.on('disconnect-all-timing-boxes', () => {
    timingBoxClients.forEach((client, matId) => {
      client.destroy();
    });
    timingBoxClients.clear();
  });
}

function connectToTimingBox(matId, ip, port, label) {
  // Disconnect existing connection if any
  const existingClient = timingBoxClients.get(matId);
  if (existingClient) {
    existingClient.destroy();
  }

  const client = new net.Socket();
  timingBoxClients.set(matId, client);

  client.connect(port, ip, () => {
    console.log(`Connected to timing mat ${matId} (${label}) at ${ip}:${port}`);
    win.webContents.send('timing-box-status', { matId, status: 'Connected' });

    // If RR box
    if(port === 3601){
        client.write('SETPROTOCOL;2.6\r\n');
        client.write('SETPUSHPASSINGS;1;0\r\n');
    }
  });

  client.on('data', (data) => {
    const records = data.toString('utf-8').split('\r\n');

    records.forEach(record => {
      if (record.trim() !== '') {
        console.log(`Data from ${matId} (${label}):`, record);
        win.webContents.send('timing-box-data', { matId, data: record });
      }
    });
  });

  client.on('close', () => {
    console.log(`Connection to timing mat ${matId} (${label}) closed`);
    timingBoxClients.delete(matId);
    win.webContents.send('timing-box-status', { matId, status: 'Disconnected' });
  });

  client.on('error', (err) => {
    console.error(`Error connecting to timing mat ${matId} (${label}):`, err);
    timingBoxClients.delete(matId);
    win.webContents.send('timing-box-status', { matId, status: 'Error', message: err.message });
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

