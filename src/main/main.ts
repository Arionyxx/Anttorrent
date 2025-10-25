import { app, BrowserWindow, ipcMain, dialog, shell, globalShortcut, Menu, Notification } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { createTray, updateTrayMenu } from './tray'
import { setupProtocolHandler } from './protocol'
import { TorrentManager } from './torrentManager'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// Store for window state and settings
const store = new Store({
  defaults: {
    windowState: {
      width: 1200,
      height: 700,
      x: undefined,
      y: undefined,
      isMaximized: false
    },
    settings: {
      downloadPath: app.getPath('downloads'),
      startWithWindows: false,
      minimizeToTray: true,
      closeToTray: true,
      showNotifications: true,
      playSound: false,
      maxDownloadSpeed: 0, // 0 = unlimited
      maxUploadSpeed: 0,
      maxConnectionsPerTorrent: 55,
      enableDHT: true,
      enablePEX: true,
      enableUPnP: true,
      autoStartTorrents: true,
      autoOpenFolder: false,
      stopSeedingAtRatio: 2.0,
      maxSimultaneousDownloads: 3,
      deleteAfterAdding: false,
      theme: 'night',
      viewMode: 'comfortable',
      showDetailsPanel: true
    }
  }
})

let mainWindow: BrowserWindow | null = null
let isQuitting = false
let torrentManager: TorrentManager

function createWindow(): void {
  const windowState = store.get('windowState') as any

  // Create the browser window with custom frame
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    frame: false, // Frameless for custom title bar
    autoHideMenuBar: true,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (windowState.isMaximized) {
      mainWindow?.maximize()
    }
    mainWindow?.show()
  })

  mainWindow.on('close', (e) => {
    if (!isQuitting && store.get('settings.closeToTray')) {
      e.preventDefault()
      mainWindow?.hide()
      return false
    }

    // Save window state
    if (mainWindow && !mainWindow.isMaximized()) {
      const bounds = mainWindow.getBounds()
      store.set('windowState', {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized: false
      })
    } else {
      store.set('windowState.isMaximized', true)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the app
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      if (!mainWindow.isVisible()) mainWindow.show()
      mainWindow.focus()

      // Handle magnet link or torrent file from command line
      const url = commandLine.find(arg => arg.startsWith('magnet:') || arg.endsWith('.torrent'))
      if (url) {
        mainWindow.webContents.send('open-torrent', url)
      }
    }
  })

  app.whenReady().then(async () => {
    // Set app user model id for windows
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.anttorrent.app')
    }

    createWindow()
    createTray(mainWindow!)
    setupProtocolHandler()

    // Initialize torrent manager
    torrentManager = new TorrentManager(store)
    await torrentManager.initialize()
    torrentManager.setWindow(mainWindow!)
    torrentManager.startUpdateLoop()

    // Load saved torrents
    await torrentManager.loadSavedTorrents()

    // Global shortcut to show/hide window
    globalShortcut.register('CommandOrControl+Alt+T', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })

    // Handle command line arguments (for magnet links/torrent files)
    const args = process.argv.slice(1)
    const url = args.find(arg => arg.startsWith('magnet:') || arg.endsWith('.torrent'))
    if (url && mainWindow) {
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow?.webContents.send('open-torrent', url)
      })
    }

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  isQuitting = true
  globalShortcut.unregisterAll()
  if (torrentManager) {
    torrentManager.destroy()
  }
})

// IPC Handlers

// Window controls
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized()
})

// Settings
ipcMain.handle('get-settings', () => {
  return store.get('settings')
})

ipcMain.handle('set-settings', (_, settings) => {
  store.set('settings', settings)
  
  // Handle start with Windows
  if (settings.startWithWindows) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath
    })
  } else {
    app.setLoginItemSettings({
      openAtLogin: false
    })
  }
  
  return true
})

// File dialogs
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('select-torrent-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Torrent Files', extensions: ['torrent'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths
  }
  return null
})

ipcMain.handle('show-item-in-folder', (_, path: string) => {
  shell.showItemInFolder(path)
})

ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url)
})

// Notifications
ipcMain.handle('show-notification', (_, options: { title: string; body: string }) => {
  if (store.get('settings.showNotifications')) {
    const notification = new Notification({
      title: options.title,
      body: options.body
    })
    notification.show()
  }
})

// Tray updates
ipcMain.on('update-tray-stats', (_, stats: { downloadSpeed: string; uploadSpeed: string }) => {
  updateTrayMenu(mainWindow!, stats)
})

// App info
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-app-path', (_, name: string) => {
  return app.getPath(name as any)
})

// Quit app
ipcMain.on('quit-app', () => {
  isQuitting = true
  app.quit()
})

// Torrent operations
ipcMain.handle('add-torrent', async (_, magnetOrPath: string, options?: { path?: string; selectedFiles?: number[] }) => {
  try {
    const infoHash = await torrentManager.addTorrent(magnetOrPath, options)
    return { success: true, infoHash }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('get-torrent-files', async (_, magnetOrPath: string) => {
  try {
    const files = await torrentManager.getTorrentFiles(magnetOrPath)
    return files
  } catch (err: any) {
    console.error('Failed to get torrent files:', err)
    return null
  }
})

ipcMain.handle('remove-torrent', async (_, infoHash: string, deleteFiles: boolean) => {
  try {
    await torrentManager.removeTorrent(infoHash, deleteFiles)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('pause-torrent', (_, infoHash: string) => {
  return torrentManager.pauseTorrent(infoHash)
})

ipcMain.handle('resume-torrent', (_, infoHash: string) => {
  return torrentManager.resumeTorrent(infoHash)
})

ipcMain.handle('pause-all-torrents', () => {
  torrentManager.pauseAll()
  return true
})

ipcMain.handle('resume-all-torrents', () => {
  torrentManager.resumeAll()
  return true
})

ipcMain.handle('get-torrents', () => {
  return torrentManager.getTorrentsInfo()
})

ipcMain.handle('get-torrent', (_, infoHash: string) => {
  return torrentManager.getTorrent(infoHash)
})

ipcMain.handle('set-download-limit', (_, infoHash: string, bytesPerSecond: number) => {
  torrentManager.setDownloadLimit(infoHash, bytesPerSecond)
  return true
})

ipcMain.handle('set-upload-limit', (_, infoHash: string, bytesPerSecond: number) => {
  torrentManager.setUploadLimit(infoHash, bytesPerSecond)
  return true
})
