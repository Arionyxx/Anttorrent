import React, { useState } from 'react'
import { Play, Pause, Trash2, FolderOpen, Copy } from 'lucide-react'
import { TorrentData } from '../types'
import ContextMenu from './ContextMenu'

interface TorrentRowProps {
  torrent: TorrentData
  isSelected: boolean
  onSelect: (infoHash: string) => void
  onPause: (infoHash: string) => void
  onResume: (infoHash: string) => void
  onRemove: (infoHash: string, deleteFiles: boolean) => void
}

const TorrentRow: React.FC<TorrentRowProps> = ({
  torrent,
  isSelected,
  onSelect,
  onPause,
  onResume,
  onRemove
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleRemove = () => {
    const deleteFiles = confirm(`Remove "${torrent.name}"?\n\nDelete files from disk?`)
    onRemove(torrent.infoHash, deleteFiles)
  }

  const statusBadge = () => {
    switch (torrent.status) {
      case 'downloading':
        return <span className="badge badge-info badge-sm">Downloading</span>
      case 'seeding':
        return <span className="badge badge-success badge-sm">Seeding</span>
      case 'paused':
        return <span className="badge badge-warning badge-sm">Paused</span>
      case 'error':
        return <span className="badge badge-error badge-sm">Error</span>
      default:
        return <span className="badge badge-ghost badge-sm">Queued</span>
    }
  }

  return (
    <>
      <tr
        className={`hover cursor-pointer ${isSelected ? 'active' : ''}`}
        onClick={() => onSelect(torrent.infoHash)}
        onContextMenu={handleContextMenu}
      >
        <td>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {torrent.status === 'paused' ? (
                <button
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={(e) => {
                    e.stopPropagation()
                    onResume(torrent.infoHash)
                  }}
                  title="Resume"
                >
                  <Play size={12} />
                </button>
              ) : (
                <button
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPause(torrent.infoHash)
                  }}
                  title="Pause"
                >
                  <Pause size={12} />
                </button>
              )}
              <button
                className="btn btn-ghost btn-xs btn-circle"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                title="Remove"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <span className="font-medium">{torrent.name}</span>
          </div>
        </td>
        <td className="text-right font-mono text-sm">{formatBytes(torrent.size)}</td>
        <td>
          <div className="flex items-center gap-2">
            <progress
              className="progress progress-primary w-32"
              value={torrent.progress * 100}
              max="100"
            />
            <span className="text-sm font-mono">{Math.round(torrent.progress * 100)}%</span>
          </div>
        </td>
        <td className="text-right font-mono text-sm text-info">{formatSpeed(torrent.downloadSpeed)}</td>
        <td className="text-right font-mono text-sm text-success">{formatSpeed(torrent.uploadSpeed)}</td>
        <td className="text-center">
          <span className="badge badge-sm badge-ghost font-mono">{torrent.numPeers}</span>
        </td>
        <td className="text-center">{statusBadge()}</td>
      </tr>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          torrent={{
            infoHash: torrent.infoHash,
            name: torrent.name,
            magnetURI: torrent.magnetURI,
            path: torrent.path,
            status: torrent.status
          }}
                  onPause={() => onPause(torrent.infoHash)}
        onResume={() => onResume(torrent.infoHash)}
        onRemove={(deleteFiles) => onRemove(torrent.infoHash, deleteFiles)}
        onOpenFolder={() => window.electron.openFolder(torrent.path)}
        onCopyMagnet={() => navigator.clipboard.writeText(torrent.magnetURI)}
        onCopyHash={() => navigator.clipboard.writeText(torrent.infoHash)}
        />
      )}
    </>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return Math.round((bytesPerSecond / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default TorrentRow
