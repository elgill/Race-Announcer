const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const chokidar = require("chokidar");

let win;
let watcher;
let lastLineCount = 0;

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
  ipcMain.on('set-file-path', handleFilePathSetting);
  ipcMain.handle('open-file-dialog', handleOpenFileDialog);
}

function stopFileWatching() {
  if (watcher) {
    watcher.close();
  }
}

function handleFilePathSetting(event, filePath) {
  stopFileWatching();

  watcher = chokidar.watch(filePath);
  watcher.on('change', handleFileChange(filePath));
}

function handleFileChange(filePath) {
  return () => {
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');
    const newLines = lines.slice(lastLineCount);
    lastLineCount = lines.length;
    win.webContents.send('file-updated', newLines);
  };
}

async function handleOpenFileDialog(event) {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  } else {
    return null;
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

