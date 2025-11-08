const { app, BrowserWindow } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs')

let mainWindow
let devServerProcess = null

// Load configuration
const configPath = path.join(__dirname, 'config.json')
let config = {
  projectName: 'Dev Panel',
  projectIcon: '🚀',
  devPanelPort: 3030,
  devServerPort: 3000,
  devServerCommand: 'npm run dev',
  commands: {},
  quickLinks: [],
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2'
  }
}

try {
  const configData = fs.readFileSync(configPath, 'utf8')
  config = { ...config, ...JSON.parse(configData) }
} catch (error) {
  console.warn('⚠️  No config.json found, using defaults')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: `${config.projectName} - Dev Panel`,
    backgroundColor: '#667eea'
  })

  // Load the index.html
  mainWindow.loadFile('index.html')

  // Open DevTools in development
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
    // Clean up dev server process if running
    if (devServerProcess) {
      devServerProcess.kill()
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC handlers for commands (if needed in future)
// Can add electron IPC here to handle command execution from renderer
