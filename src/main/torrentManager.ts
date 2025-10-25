import { BrowserWindow } from 'electron'
import Store from 'electron-store'
import { existsSync, mkdirSync } from 'fs'

// Dynamic import for WebTorrent (ES module)
let WebTorrent: any = null

export interface TorrentInfo {
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
  files: {
    name: string
    path: string
    length: number
    downloaded: number
    progress: number
  }[]
  path: string
  dateAdded: number
  error?: string
  paused?: boolean
}

export class TorrentManager {
  private client: any
  private store: Store
  private window: BrowserWindow | null = null
  private updateInterval: NodeJS.Timeout | null = null
  private pausedTorrents: Set<string> = new Set()
  private initialized: boolean = false

  constructor(store: Store) {
    this.store = store
  }

  async initialize() {
    if (this.initialized) return
    
    // Dynamically import WebTorrent
    const WebTorrentModule = await import('webtorrent')
    WebTorrent = WebTorrentModule.default || WebTorrentModule
    
    this.client = new WebTorrent({
      maxConns: 55,
      dht: true,
      webSeeds: true
    })

    // Handle client errors
    this.client.on('error', (err: any) => {
      console.error('WebTorrent error:', err)
    })

    this.initialized = true
  }

  setWindow(window: BrowserWindow) {
    this.window = window
  }

  startUpdateLoop() {
    if (this.updateInterval) return
    
    this.updateInterval = setInterval(() => {
      this.sendTorrentsUpdate()
    }, 1000)
  }

  stopUpdateLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  private sendTorrentsUpdate() {
    if (!this.window || !this.initialized) return

    const torrents = this.getTorrentsInfo()
    this.window.webContents.send('torrents-update', torrents)

    // Calculate stats
    const stats = {
      downloadSpeed: torrents.reduce((sum, t) => sum + t.downloadSpeed, 0),
      uploadSpeed: torrents.reduce((sum, t) => sum + t.uploadSpeed, 0),
      numActive: torrents.filter(t => t.status === 'downloading' || t.status === 'seeding').length,
      totalDownloaded: torrents.reduce((sum, t) => sum + t.downloaded, 0),
      totalUploaded: torrents.reduce((sum, t) => sum + t.uploaded, 0)
    }

    this.window.webContents.send('stats-update', stats)
  }

  async addTorrent(magnetOrPath: string, options: { path?: string } = {}): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const settings = this.store.get('settings') as any
      const downloadPath = options.path || settings.downloadPath

      // Ensure download directory exists
      if (!existsSync(downloadPath)) {
        mkdirSync(downloadPath, { recursive: true })
      }

      this.client.add(
        magnetOrPath,
        { path: downloadPath },
        (torrent: any) => {
          // Save to store
          this.saveTorrentState(torrent.infoHash, {
            magnetURI: torrent.magnetURI,
            path: downloadPath,
            dateAdded: Date.now()
          })

          // Setup torrent event listeners
          this.setupTorrentListeners(torrent)

          resolve(torrent.infoHash)
        }
      )
    })
  }

  private setupTorrentListeners(torrent: any) {
    torrent.on('done', () => {
      const settings = this.store.get('settings') as any
      
      if (this.window) {
        this.window.webContents.send('torrent-done', torrent.infoHash)
        
        if (settings.showNotifications) {
          this.window.webContents.send('show-notification', {
            title: 'Download Complete',
            body: torrent.name
          })
        }

        if (settings.autoOpenFolder) {
          this.window.webContents.send('open-folder', torrent.path)
        }
      }

      // Check if we should stop seeding
      if (settings.stopSeedingAtRatio > 0) {
        const checkRatio = () => {
          const ratio = torrent.uploaded / (torrent.downloaded || 1)
          if (ratio >= settings.stopSeedingAtRatio) {
            this.pauseTorrent(torrent.infoHash)
          } else {
            setTimeout(checkRatio, 10000) // Check every 10 seconds
          }
        }
        checkRatio()
      }
    })

    torrent.on('error', (err: any) => {
      console.error(`Torrent error (${torrent.name}):`, err)
      if (this.window) {
        this.window.webContents.send('torrent-error', {
          infoHash: torrent.infoHash,
          error: err.message
        })
      }
    })

    torrent.on('warning', (warn: any) => {
      console.warn(`Torrent warning (${torrent.name}):`, warn)
    })
  }

  removeTorrent(infoHash: string, deleteFiles: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('TorrentManager not initialized'))
        return
      }

      const torrent = this.client.get(infoHash)
      if (!torrent) {
        reject(new Error('Torrent not found'))
        return
      }

      this.client.remove(infoHash, { destroyStore: deleteFiles }, (err: any) => {
        if (err) {
          reject(err)
        } else {
          // Remove from store
          this.removeTorrentState(infoHash)
          this.pausedTorrents.delete(infoHash)
          resolve()
        }
      })
    })
  }

  pauseTorrent(infoHash: string): boolean {
    if (!this.initialized) return false
    
    const torrent = this.client.get(infoHash) as any
    if (!torrent) return false

    torrent.pause()
    this.pausedTorrents.add(infoHash)
    this.saveTorrentState(infoHash, { paused: true })
    return true
  }

  resumeTorrent(infoHash: string): boolean {
    if (!this.initialized) return false
    
    const torrent = this.client.get(infoHash) as any
    if (!torrent) return false

    torrent.resume()
    this.pausedTorrents.delete(infoHash)
    this.saveTorrentState(infoHash, { paused: false })
    return true
  }

  pauseAll() {
    if (!this.initialized) return
    
    this.client.torrents.forEach((torrent: any) => {
      torrent.pause()
      this.pausedTorrents.add(torrent.infoHash)
    })
  }

  resumeAll() {
    if (!this.initialized) return
    
    this.client.torrents.forEach((torrent: any) => {
      torrent.resume()
      this.pausedTorrents.delete(torrent.infoHash)
    })
  }

  getTorrentsInfo(): TorrentInfo[] {
    if (!this.initialized || !this.client) return []
    
    return this.client.torrents.map((torrent: any) => {
      const isPaused = this.pausedTorrents.has(torrent.infoHash)
      const savedState = this.getTorrentState(torrent.infoHash)
      
      return {
        infoHash: torrent.infoHash,
        name: torrent.name || 'Unknown',
        magnetURI: torrent.magnetURI,
        size: torrent.length || 0,
        downloaded: torrent.downloaded,
        uploaded: torrent.uploaded,
        downloadSpeed: isPaused ? 0 : torrent.downloadSpeed,
        uploadSpeed: isPaused ? 0 : torrent.uploadSpeed,
        progress: torrent.progress,
        ratio: torrent.uploaded / (torrent.downloaded || 1),
        numPeers: torrent.numPeers,
        timeRemaining: torrent.timeRemaining,
        status: isPaused ? 'paused' : torrent.done ? 'seeding' : 'downloading',
        files: torrent.files.map((file: any) => ({
          name: file.name,
          path: file.path,
          length: file.length,
          downloaded: file.downloaded,
          progress: file.progress
        })),
        path: savedState?.path || torrent.path || '',
        dateAdded: savedState?.dateAdded || Date.now(),
        paused: isPaused
      }
    })
  }

  getTorrent(infoHash: string): TorrentInfo | null {
    if (!this.initialized) return null
    
    const torrent = this.client.get(infoHash)
    if (!torrent) return null

    const torrents = this.getTorrentsInfo()
    return torrents.find(t => t.infoHash === infoHash) || null
  }

  private saveTorrentState(infoHash: string, data: any) {
    const torrents = this.store.get('torrents', {}) as any
    torrents[infoHash] = { ...torrents[infoHash], ...data }
    this.store.set('torrents', torrents)
  }

  private getTorrentState(infoHash: string): any {
    const torrents = this.store.get('torrents', {}) as any
    return torrents[infoHash]
  }

  private removeTorrentState(infoHash: string) {
    const torrents = this.store.get('torrents', {}) as any
    delete torrents[infoHash]
    this.store.set('torrents', torrents)
  }

  async loadSavedTorrents() {
    if (!this.initialized) {
      await this.initialize()
    }

    const torrents = this.store.get('torrents', {}) as any
    const settings = this.store.get('settings') as any

    for (const [infoHash, data] of Object.entries(torrents)) {
      try {
        const torrentData = data as any
        
        // Re-add torrent
        await this.addTorrent(torrentData.magnetURI, {
          path: torrentData.path
        })

        // Restore paused state
        if (torrentData.paused || !settings.autoStartTorrents) {
          this.pauseTorrent(infoHash)
        }
      } catch (err) {
        console.error(`Failed to restore torrent ${infoHash}:`, err)
      }
    }
  }

  setDownloadLimit(infoHash: string, bytesPerSecond: number) {
    if (!this.initialized) return
    
    const torrent = this.client.get(infoHash) as any
    if (torrent && torrent.downloadSpeed) {
      torrent.downloadSpeed = bytesPerSecond
    }
  }

  setUploadLimit(infoHash: string, bytesPerSecond: number) {
    if (!this.initialized) return
    
    const torrent = this.client.get(infoHash) as any
    if (torrent && torrent.uploadSpeed) {
      torrent.uploadSpeed = bytesPerSecond
    }
  }

  async createTorrent(paths: string[], options: any = {}): Promise<any> {
    if (!this.initialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      this.client.seed(paths, options, (torrent: any) => {
        resolve(torrent)
      })
    })
  }

  destroy() {
    this.stopUpdateLoop()
    if (this.client) {
      this.client.destroy()
    }
  }
}
