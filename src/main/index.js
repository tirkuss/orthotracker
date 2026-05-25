import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupDbHandlers, initDb } from './db.js'
import { setupImageHandlers } from './images.js'
import { setupBackupHandlers, startAutosave } from './backup.js'
import { setupPdfHandlers } from './pdf.js'

let mainWindow

function createWindow() {
  var windowOptions = {
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true
    }
  }

  mainWindow = new BrowserWindow(windowOptions)
  mainWindow.on('ready-to-show', function() { mainWindow.show() })
  mainWindow.webContents.setWindowOpenHandler(function(details) {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(function() {
  electronApp.setAppUserModelId('com.orthotracker')
  app.on('browser-window-created', function(_, window) { optimizer.watchWindowShortcuts(window) })

  setupDbHandlers()
  setupImageHandlers()
  setupBackupHandlers()
  setupPdfHandlers()

  ipcMain.removeHandler('db:init')
  ipcMain.handle('db:init', async function(event, path) {
    var paths = initDb(path)
    startAutosave(paths)
    return paths
  })

  createWindow()
  app.on('activate', function() { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
ipcMain.handle('app:confirm-exit', async () => {
  var choice = dialog.showMessageBoxSync(mainWindow, {
    type: 'question',
    buttons: ['Yes', 'No'],
    title: 'Confirm Exit',
    message: 'Are you sure you want to exit?'
  })
  if (choice === 0) app.exit()
})