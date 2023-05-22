const { app, BrowserWindow } = require('electron')
const { Menu } = require('electron')

let win

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, //i switched
      worldSafeExecuteJavaScript: true
    },
    icon: __dirname + '/dist/race-announcer-angular/favicon.ico'
  })

  win.loadFile('dist/race-announcer-angular/index.html')

  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
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

