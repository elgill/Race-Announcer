const { app, BrowserWindow , ipcMain} = require('electron')
const { Menu } = require('electron')
const fs = require('fs');
const chokidar = require("chokidar");

let win

let watcher; // Keep track of the current file watcher
let lastLineCount = 0; // Keep track of the number of lines in the file

function createWindow () {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      worldSafeExecuteJavaScript: true
    },
    icon: __dirname + '/dist/race-announcer-angular/favicon.ico'
  })

  win.loadFile('dist/race-announcer-angular/index.html')

  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })

// Handle IPC message for setting the file path
  ipcMain.on('set-file-path', (event, filePath) => {
    // Stop watching the previous file
    if (watcher) {
      watcher.close();
    }

    // Start watching the new file
    watcher = chokidar.watch(filePath);

    watcher.on('change', (path) => {
      // Read the file, parse new lines, and send them to the renderer process
      const data = fs.readFileSync(filePath, 'utf-8');
      const lines = data.split('\n');
      const newLines = lines.slice(lastLineCount);
      lastLineCount = lines.length;
      win.webContents.send('file-updated', newLines);
    });
  });

  app.on('before-quit', () => {
    if (watcher) {
      watcher.close(); // stop watching the file when the app is closing
    }
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

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
        label: 'Open',
        click() { /* Code to open file dialog and import CSV goes here */ }
      },
      {
        label: 'Save',
        click() { /* Code to save current state goes here */ }
      },
      {
        label: 'Load',
        click() { /* Code to open file dialog and load state goes here */ }
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
        label: 'Settings',
        click() { /* Code to open SettingsComponent goes here */ }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click() { /* Code to display about information goes here */ }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

