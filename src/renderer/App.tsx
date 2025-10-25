import React, { useState, useEffect, useCallback, useRef } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import TorrentTable from './components/TorrentTable'
import DetailsPanel from './components/DetailsPanel'
import AddTorrentModal from './components/AddTorrentModal'
import SettingsModal from './components/SettingsModal'
import StatusBar from './components/StatusBar'
import { TorrentData, Settings, GlobalStats } from './types'
import { Search, Plus, PlayCircle, PauseCircle } from 'lucide-react'

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
  const [dragOver, setDragOver] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)

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

  // Listen for torrent updates from main process
  useEffect(() => {
    window.electron.onTorrentsUpdate((updatedTorrents) => {
      setTorrents(updatedTorrents)
    })

    window.electron.onStatsUpdate((stats) => {
      setGlobalStats(stats)
      
      // Update tray
      window.electron.updateTrayStats({
        downloadSpeed: formatSpeed(stats.downloadSpeed),
        uploadSpeed: formatSpeed(stats.uploadSpeed)
      })
    })

    window.electron.onTorrentDone((infoHash) => {
      const torrent = torrents.find(t => t.infoHash === infoHash)
      if (torrent && settings?.showNotifications) {
        window.electron.showNotification({
          title: 'Download Complete',
          body: torrent.name
        })
      }
    })

    window.electron.onTorrentError((data) => {
      console.error(`Torrent error ${data.infoHash}:`, data.error)
    })

    return () => {
      window.electron.removeAllListeners('torrents-update')
      window.electron.removeAllListeners('stats-update')
      window.electron.removeAllListeners('torrent-done')
      window.electron.removeAllListeners('torrent-error')
    }
  }, [torrents, settings])

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

  // Drag and Drop handlers
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)

      if (e.dataTransfer?.files) {
        for (const file of Array.from(e.dataTransfer.files)) {
          if (file.path.endsWith('.torrent')) {
            await handleAddTorrent(file.path, settings?.downloadPath)
          }
        }
      }

      // Check for text (magnet links)
      const text = e.dataTransfer?.getData('text')
      if (text && text.startsWith('magnet:')) {
        await handleAddTorrent(text, settings?.downloadPath)
      }
    }

    const element = dropZoneRef.current
    if (element) {
      element.addEventListener('dragover', handleDragOver)
      element.addEventListener('dragleave', handleDragLeave)
      element.addEventListener('drop', handleDrop)

      return () => {
        element.removeEventListener('dragover', handleDragOver)
        element.removeEventListener('dragleave', handleDragLeave)
        element.removeEventListener('drop', handleDrop)
      }
    }
  }, [settings])

  // Clipboard monitoring for magnet links
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        if (text.startsWith('magnet:') && settings?.showNotifications) {
          // Could add a notification here asking if user wants to add the magnet link
        }
      } catch (err) {
        // Clipboard access denied or not available
      }
    }

    const interval = setInterval(checkClipboard, 5000)
    return () => clearInterval(interval)
  }, [settings])

  // Torrent operations
  const handleAddTorrent = async (magnetOrPath: string, customPath?: string, selectedFiles?: number[]) => {
    const downloadPath = customPath || settings?.downloadPath
    
    const result = await window.electron.addTorrent(magnetOrPath, {
      path: downloadPath
    })

    if (result.success) {
      if (settings?.showNotifications) {
        window.electron.showNotification({
          title: 'Torrent Added',
          body: 'Download started'
        })
      }
    } else {
      alert(`Failed to add torrent: ${result.error}`)
    }
  }

  const handleRemoveTorrent = async (infoHash: string, deleteFiles: boolean = false) => {
    const result = await window.electron.removeTorrent(infoHash, deleteFiles)
    
    if (!result.success) {
      alert(`Failed to remove torrent: ${result.error}`)
    }

    if (selectedTorrent === infoHash) {
      setSelectedTorrent(null)
    }
  }

  const handlePauseTorrent = async (infoHash: string) => {
    await window.electron.pauseTorrent(infoHash)
  }

  const handleResumeTorrent = async (infoHash: string) => {
    await window.electron.resumeTorrent(infoHash)
  }

  const handlePauseAll = async () => {
    await window.electron.pauseAllTorrents()
  }

  const handleResumeAll = async () => {
    await window.electron.resumeAllTorrents()
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
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl+O: Open torrent
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault()
        const files = await window.electron.selectTorrentFile()
        if (files) {
          for (const file of files) {
            await handleAddTorrent(file, settings?.downloadPath)
          }
        }
      }
      // Ctrl+U: Add from URL/Magnet
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        setShowAddModal(true)
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
        await handleRemoveTorrent(selectedTorrent, deleteFiles)
      }
      // Space: Pause/Resume
      if (e.key === ' ' && selectedTorrent) {
        e.preventDefault()
        const torrent = torrents.find(t => t.infoHash === selectedTorrent)
        if (torrent?.status === 'paused') {
          await handleResumeTorrent(selectedTorrent)
        } else {
          await handlePauseTorrent(selectedTorrent)
        }
      }
      // Ctrl+A: Select all (could be implemented)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        // Multi-select functionality could be added
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTorrent, torrents, settings])

  const handleOpenTorrentFile = async () => {
    const files = await window.electron.selectTorrentFile()
    if (files) {
      for (const file of files) {
        await handleAddTorrent(file, settings?.downloadPath)
      }
    }
  }

  return (
    <div 
      ref={dropZoneRef}
      className={`h-screen flex flex-col bg-base-100 ${dragOver ? 'ring-4 ring-primary ring-inset' : ''}`}
    >
      <TitleBar
        onSettingsClick={() => setShowSettingsModal(true)}
      />

      {dragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-base-100/90 backdrop-blur-sm">
          <div className="card bg-primary text-primary-content w-96">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl">Drop Torrent Files Here</h2>
              <p>Release to add torrents</p>
            </div>
          </div>
        </div>
      )}

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
              title="Add magnet link (Ctrl+U)"
            >
              <Plus size={16} />
              Add Magnet
            </button>

            <button
              className="btn btn-secondary btn-sm gap-2"
              onClick={handleOpenTorrentFile}
              title="Open torrent file (Ctrl+O)"
            >
              <Plus size={16} />
              Add File
            </button>

            <div className="btn-group">
              <button
                className="btn btn-sm gap-2"
                onClick={handleResumeAll}
                title="Resume all"
              >
                <PlayCircle size={16} />
                Resume All
              </button>
              <button
                className="btn btn-sm gap-2"
                onClick={handlePauseAll}
                title="Pause all"
              >
                <PauseCircle size={16} />
                Pause All
              </button>
            </div>

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
          onSave={async (newSettings) => {
            setSettings(newSettings)
            await window.electron.setSettings(newSettings)
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
