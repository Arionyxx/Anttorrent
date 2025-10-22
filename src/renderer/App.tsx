import React, { useState, useEffect, useCallback } from 'react'
import WebTorrent from 'webtorrent'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import TorrentTable from './components/TorrentTable'
import DetailsPanel from './components/DetailsPanel'
import AddTorrentModal from './components/AddTorrentModal'
import SettingsModal from './components/SettingsModal'
import StatusBar from './components/StatusBar'
import { TorrentData, Settings, GlobalStats } from './types'
import { Search, Plus } from 'lucide-react'

const client = new WebTorrent()

function App() {
  const [torrents, setTorrents] = useState<TorrentData[]>([])
  const [selectedTorrent, setSelectedTorrent] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    numActive: 0,
    totalDownloaded: 0,
    totalUploaded: 0
  })

  // Load settings
  useEffect(() => {
    window.electron.getSettings().then(setSettings)
  }, [])

  // Update theme
  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme)
    }
  }, [settings?.theme])

  // Update torrents state from WebTorrent client
  const updateTorrents = useCallback(() => {
    const torrentData: TorrentData[] = client.torrents.map((torrent: any) => ({
      infoHash: torrent.infoHash,
      name: torrent.name || 'Unknown',
      magnetURI: torrent.magnetURI,
      size: torrent.length || 0,
      downloaded: torrent.downloaded,
      uploaded: torrent.uploaded,
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      progress: torrent.progress,
      ratio: torrent.uploaded / (torrent.downloaded || 1),
      numPeers: torrent.numPeers,
      timeRemaining: torrent.timeRemaining,
      status: torrent.paused ? 'paused' : torrent.done ? 'seeding' : 'downloading',
      files: torrent.files.map((file: any) => ({
        name: file.name,
        path: file.path,
        length: file.length,
        downloaded: file.downloaded,
        progress: file.progress
      })),
      path: torrent.path || '',
      dateAdded: Date.now()
    }))

    setTorrents(torrentData)

    // Update global stats
    const stats: GlobalStats = {
      downloadSpeed: torrentData.reduce((sum, t) => sum + t.downloadSpeed, 0),
      uploadSpeed: torrentData.reduce((sum, t) => sum + t.uploadSpeed, 0),
      numActive: torrentData.filter(t => t.status === 'downloading' || t.status === 'seeding').length,
      totalDownloaded: torrentData.reduce((sum, t) => sum + t.downloaded, 0),
      totalUploaded: torrentData.reduce((sum, t) => sum + t.uploaded, 0)
    }
    setGlobalStats(stats)

    // Update tray
    window.electron.updateTrayStats({
      downloadSpeed: formatSpeed(stats.downloadSpeed),
      uploadSpeed: formatSpeed(stats.uploadSpeed)
    })
  }, [])

  // Update torrents periodically
  useEffect(() => {
    const interval = setInterval(updateTorrents, 1000)
    return () => clearInterval(interval)
  }, [updateTorrents])

  // Handle external torrent opens
  useEffect(() => {
    window.electron.onOpenTorrent((url) => {
      handleAddTorrent(url)
    })

    window.electron.onTrayAction((action) => {
      if (action === 'pause-all') handlePauseAll()
      if (action === 'resume-all') handleResumeAll()
      if (action === 'quit') window.electron.quitApp()
    })

    return () => {
      window.electron.removeAllListeners('open-torrent')
      window.electron.removeAllListeners('tray-action')
    }
  }, [])

  // Torrent operations
  const handleAddTorrent = (magnetOrPath: string) => {
    const downloadPath = settings?.downloadPath || ''
    client.add(magnetOrPath, { path: downloadPath }, (torrent: any) => {
      updateTorrents()
      if (settings?.showNotifications) {
        window.electron.showNotification({
          title: 'Torrent Added',
          body: torrent.name
        })
      }
    })
  }

  const handleRemoveTorrent = (infoHash: string, deleteFiles: boolean = false) => {
    const torrent = client.get(infoHash)
    if (torrent) {
      client.remove(infoHash, { destroyStore: deleteFiles }, () => {
        updateTorrents()
        if (selectedTorrent === infoHash) {
          setSelectedTorrent(null)
        }
      })
    }
  }

  const handlePauseTorrent = (infoHash: string) => {
    const torrent = client.get(infoHash) as any
    if (torrent) {
      torrent.pause()
      updateTorrents()
    }
  }

  const handleResumeTorrent = (infoHash: string) => {
    const torrent = client.get(infoHash) as any
    if (torrent) {
      torrent.resume()
      updateTorrents()
    }
  }

  const handlePauseAll = () => {
    client.torrents.forEach((torrent: any) => torrent.pause())
    updateTorrents()
  }

  const handleResumeAll = () => {
    client.torrents.forEach((torrent: any) => torrent.resume())
    updateTorrents()
  }

  // Filter torrents
  const filteredTorrents = torrents.filter(torrent => {
    // Filter by status
    if (filter === 'downloading' && torrent.status !== 'downloading') return false
    if (filter === 'completed' && torrent.status !== 'seeding') return false
    if (filter === 'seeding' && torrent.status !== 'seeding') return false
    if (filter === 'paused' && torrent.status !== 'paused') return false

    // Filter by search
    if (searchQuery && !torrent.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    return true
  })

  const selectedTorrentData = torrents.find(t => t.infoHash === selectedTorrent)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+O: Open torrent
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault()
        window.electron.selectTorrentFile().then(files => {
          if (files) {
            files.forEach(handleAddTorrent)
          }
        })
      }
      // Ctrl+,: Settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault()
        setShowSettingsModal(true)
      }
      // Delete: Remove selected
      if (e.key === 'Delete' && selectedTorrent) {
        e.preventDefault()
        const deleteFiles = confirm('Delete files from disk?')
        handleRemoveTorrent(selectedTorrent, deleteFiles)
      }
      // Space: Pause/Resume
      if (e.key === ' ' && selectedTorrent) {
        e.preventDefault()
        const torrent = torrents.find(t => t.infoHash === selectedTorrent)
        if (torrent?.status === 'paused') {
          handleResumeTorrent(selectedTorrent)
        } else {
          handlePauseTorrent(selectedTorrent)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTorrent, torrents])

  return (
    <div className="h-screen flex flex-col bg-base-100">
      <TitleBar
        onSettingsClick={() => setShowSettingsModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          filter={filter}
          onFilterChange={setFilter}
          torrents={torrents}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action bar */}
          <div className="p-4 border-b border-base-300 flex items-center gap-4">
            <button
              className="btn btn-primary btn-sm gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              Add Torrent
            </button>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={16} />
              <input
                type="text"
                placeholder="Search torrents..."
                className="input input-bordered input-sm w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="stats stats-horizontal shadow-lg">
              <div className="stat py-2 px-4">
                <div className="stat-title text-xs">Download</div>
                <div className="stat-value text-sm text-info">{formatSpeed(globalStats.downloadSpeed)}</div>
              </div>
              <div className="stat py-2 px-4">
                <div className="stat-title text-xs">Upload</div>
                <div className="stat-value text-sm text-success">{formatSpeed(globalStats.uploadSpeed)}</div>
              </div>
              <div className="stat py-2 px-4">
                <div className="stat-title text-xs">Active</div>
                <div className="stat-value text-sm">{globalStats.numActive}</div>
              </div>
            </div>
          </div>

          {/* Torrent table */}
          <div className="flex-1 overflow-auto">
            <TorrentTable
              torrents={filteredTorrents}
              selectedTorrent={selectedTorrent}
              onSelectTorrent={setSelectedTorrent}
              onPauseTorrent={handlePauseTorrent}
              onResumeTorrent={handleResumeTorrent}
              onRemoveTorrent={handleRemoveTorrent}
            />
          </div>

          {/* Details panel */}
          {settings?.showDetailsPanel && selectedTorrentData && (
            <DetailsPanel torrent={selectedTorrentData} />
          )}
        </div>
      </div>

      <StatusBar stats={globalStats} />

      {/* Modals */}
      {showAddModal && (
        <AddTorrentModal
          onClose={() => setShowAddModal(false)}
          onAddTorrent={handleAddTorrent}
          defaultPath={settings?.downloadPath || ''}
        />
      )}

      {showSettingsModal && settings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onSave={(newSettings) => {
            setSettings(newSettings)
            window.electron.setSettings(newSettings)
            setShowSettingsModal(false)
          }}
        />
      )}
    </div>
  )
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return Math.round((bytesPerSecond / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default App
