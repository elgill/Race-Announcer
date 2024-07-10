const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const net = require('net');
const startBackend = require('./start-backend');

let win;
let timingBoxClient;
let backendProcess;

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
    win = null;
    if (backendProcess) {
      backendProcess.kill();
    }
  })

  setupIPCListeners();

  //win.webContents.openDevTools();
}

app.on('ready', () => {
  backendProcess = startBackend();
  createWindow();
})

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});

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

    // If RR box
    if(port === 3601){
        timingBoxClient.write('SETPROTOCOL;2.6\r\n');
        timingBoxClient.write('SETPUSHPASSINGS;1;0\r\n');
    }

  });

  timingBoxClient.on('data', (data) => {
    const records = data.toString('utf-8').split('\r\n');

    records.forEach(record => {
      if (record.trim() !== '') {
        console.log('Data: ', record);
        win.webContents.send('timing-box-data', record);
      }
    });
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

