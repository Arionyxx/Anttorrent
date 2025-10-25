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
  },

  // Torrent operations
  addTorrent: (magnetOrPath: string, options?: { path?: string; selectedFiles?: number[] }) => 
    ipcRenderer.invoke('add-torrent', magnetOrPath, options),
  getTorrentFiles: (magnetOrPath: string) =>
    ipcRenderer.invoke('get-torrent-files', magnetOrPath),
  removeTorrent: (infoHash: string, deleteFiles: boolean) => 
    ipcRenderer.invoke('remove-torrent', infoHash, deleteFiles),
  pauseTorrent: (infoHash: string) => 
    ipcRenderer.invoke('pause-torrent', infoHash),
  resumeTorrent: (infoHash: string) => 
    ipcRenderer.invoke('resume-torrent', infoHash),
  pauseAllTorrents: () => 
    ipcRenderer.invoke('pause-all-torrents'),
  resumeAllTorrents: () => 
    ipcRenderer.invoke('resume-all-torrents'),
  getTorrents: () => 
    ipcRenderer.invoke('get-torrents'),
  getTorrent: (infoHash: string) => 
    ipcRenderer.invoke('get-torrent', infoHash),
  setDownloadLimit: (infoHash: string, bytesPerSecond: number) => 
    ipcRenderer.invoke('set-download-limit', infoHash, bytesPerSecond),
  setUploadLimit: (infoHash: string, bytesPerSecond: number) => 
    ipcRenderer.invoke('set-upload-limit', infoHash, bytesPerSecond),

  // Event listeners for torrent updates
  onTorrentsUpdate: (callback: (torrents: any[]) => void) => {
    ipcRenderer.on('torrents-update', (_, torrents) => callback(torrents))
  },
  onStatsUpdate: (callback: (stats: any) => void) => {
    ipcRenderer.on('stats-update', (_, stats) => callback(stats))
  },
  onTorrentDone: (callback: (infoHash: string) => void) => {
    ipcRenderer.on('torrent-done', (_, infoHash) => callback(infoHash))
  },
  onTorrentError: (callback: (data: { infoHash: string; error: string }) => void) => {
    ipcRenderer.on('torrent-error', (_, data) => callback(data))
  }
})
