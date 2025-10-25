export interface TorrentData {
  infoHash: string
  name: string
  magnetURI: string
  size: number
  downloaded: number
  uploaded: number
  downloadSpeed: number
  uploadSpeed: number
  progress: number
  ratio: number
  numPeers: number
  timeRemaining: number
  status: 'downloading' | 'seeding' | 'paused' | 'error' | 'queued'
  files: TorrentFile[]
  path: string
  dateAdded: number
  error?: string
}

export interface TorrentFile {
  name: string
  path: string
  length: number
  downloaded: number
  progress: number
}

export interface Settings {
  downloadPath: string
  startWithWindows: boolean
  minimizeToTray: boolean
  closeToTray: boolean
  showNotifications: boolean
  playSound: boolean
  maxDownloadSpeed: number
  maxUploadSpeed: number
  maxConnectionsPerTorrent: number
  enableDHT: boolean
  enablePEX: boolean
  enableUPnP: boolean
  autoStartTorrents: boolean
  autoOpenFolder: boolean
  stopSeedingAtRatio: number
  maxSimultaneousDownloads: number
  deleteAfterAdding: boolean
  theme: string
  viewMode: 'compact' | 'comfortable' | 'spacious'
  showDetailsPanel: boolean
}

export interface GlobalStats {
  downloadSpeed: number
  uploadSpeed: number
  numActive: number
  totalDownloaded: number
  totalUploaded: number
}

declare global {
  interface Window {
    electron: {
      windowMinimize: () => void
      windowMaximize: () => void
      windowClose: () => void
      windowIsMaximized: () => Promise<boolean>
      getSettings: () => Promise<Settings>
      setSettings: (settings: Settings) => Promise<boolean>
      selectFolder: () => Promise<string | null>
      selectTorrentFile: () => Promise<string[] | null>
      showItemInFolder: (path: string) => Promise<void>
      openExternal: (url: string) => Promise<void>
      showNotification: (options: { title: string; body: string }) => Promise<void>
      updateTrayStats: (stats: { downloadSpeed: string; uploadSpeed: string }) => void
      getAppVersion: () => Promise<string>
      getAppPath: (name: string) => Promise<string>
      quitApp: () => void
      onOpenTorrent: (callback: (url: string) => void) => void
      onTrayAction: (callback: (action: string) => void) => void
      removeAllListeners: (channel: string) => void
      
      // Torrent operations
      addTorrent: (magnetOrPath: string, options?: { path?: string }) => Promise<{ success: boolean; infoHash?: string; error?: string }>
      removeTorrent: (infoHash: string, deleteFiles: boolean) => Promise<{ success: boolean; error?: string }>
      pauseTorrent: (infoHash: string) => Promise<boolean>
      resumeTorrent: (infoHash: string) => Promise<boolean>
      pauseAllTorrents: () => Promise<boolean>
      resumeAllTorrents: () => Promise<boolean>
      getTorrents: () => Promise<TorrentData[]>
      getTorrent: (infoHash: string) => Promise<TorrentData | null>
      setDownloadLimit: (infoHash: string, bytesPerSecond: number) => Promise<boolean>
      setUploadLimit: (infoHash: string, bytesPerSecond: number) => Promise<boolean>
      
      // Event listeners
      onTorrentsUpdate: (callback: (torrents: TorrentData[]) => void) => void
      onStatsUpdate: (callback: (stats: GlobalStats) => void) => void
      onTorrentDone: (callback: (infoHash: string) => void) => void
      onTorrentError: (callback: (data: { infoHash: string; error: string }) => void) => void
    }
  }
}
