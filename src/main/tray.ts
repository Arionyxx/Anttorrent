import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow): void {
  // Create tray icon (you'll need to add an actual icon file)
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  
  tray.setToolTip('AntTorrent')
  
  updateTrayMenu(mainWindow, { downloadSpeed: '0 B/s', uploadSpeed: '0 B/s' })
  
  // Double click to show/hide window
  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

export function updateTrayMenu(
  mainWindow: BrowserWindow,
  stats: { downloadSpeed: string; uploadSpeed: string }
): void {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show AntTorrent',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: `↓ ${stats.downloadSpeed}  ↑ ${stats.uploadSpeed}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Pause All',
      click: () => {
        mainWindow.webContents.send('tray-action', 'pause-all')
      }
    },
    {
      label: 'Resume All',
      click: () => {
        mainWindow.webContents.send('tray-action', 'resume-all')
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        mainWindow.webContents.send('tray-action', 'quit')
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
