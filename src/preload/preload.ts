import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: any) => ipcRenderer.invoke('set-settings', settings),
  
  // File operations
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectTorrentFile: () => ipcRenderer.invoke('select-torrent-file'),
  showItemInFolder: (path: string) => ipcRenderer.invoke('show-item-in-folder', path),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  
  // Notifications
  showNotification: (options: { title: string; body: string }) => 
    ipcRenderer.invoke('show-notification', options),
  
  // Tray
  updateTrayStats: (stats: { downloadSpeed: string; uploadSpeed: string }) => 
    ipcRenderer.send('update-tray-stats', stats),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: (name: string) => ipcRenderer.invoke('get-app-path', name),
  
  // App control
  quitApp: () => ipcRenderer.send('quit-app'),
  
  // Event listeners
  onOpenTorrent: (callback: (url: string) => void) => {
    ipcRenderer.on('open-torrent', (_, url) => callback(url))
  },
  onTrayAction: (callback: (action: string) => void) => {
    ipcRenderer.on('tray-action', (_, action) => callback(action))
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
})
