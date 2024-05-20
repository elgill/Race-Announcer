const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const net = require('net');

let win;
let watcher;
let timingBoxClient;

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
  win.loadFile('dist/race-announcer-angular/index.html')

  win.on('closed', () => {
    win = null
  })

  setupIPCListeners();

  app.on('before-quit', stopFileWatching);
}

app.on('ready', createWindow)

app.on('window-all-closed', app.quit)

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function setupIPCListeners() {
  ipcMain.on('connect-timing-box', (event, { ip, port }) => {
    connectToTimingBox(ip, port);
  });

  ipcMain.on('disconnect-timing-box', () => {
    if (timingBoxClient) {
      timingBoxClient.destroy();
      timingBoxClient = null;
    }
  });
}

function connectToTimingBox(ip, port) {
  timingBoxClient = new net.Socket();
  timingBoxClient.connect(port, ip, () => {
    console.log('Connected to timing box');
    win.webContents.send('timing-box-status', { status: 'Connected' });
  });

  timingBoxClient.on('data', (data) => {
    const record = data.toString('utf-8');
    const parsedRecord = record;
    console.log('Data: ', record);
    win.webContents.send('timing-box-data', parsedRecord);
  });

  timingBoxClient.on('close', () => {
    console.log('Connection to timing box closed');
    win.webContents.send('timing-box-status', { status: 'Disconnected' });
  });

  timingBoxClient.on('error', (err) => {
    console.error('Error connecting to timing box:', err);
    win.webContents.send('timing-box-status', { status: 'Error', message: err.message });
  });
}

function stopFileWatching() {
  if (watcher) {
    watcher.close();
  }
}

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        click() { win.webContents.send('menu-clicked', '/settings'); }
      },
      {
        label: 'Import / Export',
        click() { win.webContents.send('menu-clicked', '/import'); }
      },
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
      {
        label: 'Settings',
        click() { win.webContents.send('menu-clicked', '/settings'); }
      }
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

