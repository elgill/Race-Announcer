const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const net = require('net');
const startBackend = require('./start-backend');

let win;
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

  win.webContents.openDevTools();
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

