import React from 'react'
import TorrentRow from './TorrentRow'
import { TorrentData } from '../types'

interface TorrentTableProps {
  torrents: TorrentData[]
  selectedTorrent: string | null
  onSelectTorrent: (infoHash: string) => void
  onPauseTorrent: (infoHash: string) => void
  onResumeTorrent: (infoHash: string) => void
  onRemoveTorrent: (infoHash: string, deleteFiles: boolean) => void
}

const TorrentTable: React.FC<TorrentTableProps> = ({
  torrents,
  selectedTorrent,
  onSelectTorrent,
  onPauseTorrent,
  onResumeTorrent,
  onRemoveTorrent
}) => {
  if (torrents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="card bg-base-200">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No Torrents</h2>
            <p>Click "Add Torrent" to get started, or drag & drop a .torrent file here</p>
            <p className="text-sm text-base-content/60 mt-2">
              You can also use <kbd className="kbd kbd-sm">Ctrl+O</kbd> to open torrents or{' '}
              <kbd className="kbd kbd-sm">Ctrl+V</kbd> to paste magnet links
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-pin-rows">
        <thead>
          <tr>
            <th>Name</th>
            <th className="text-right">Size</th>
            <th className="text-center">Progress</th>
            <th className="text-right">↓ Speed</th>
            <th className="text-right">↑ Speed</th>
            <th className="text-center">Peers</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {torrents.map(torrent => (
            <TorrentRow
              key={torrent.infoHash}
              torrent={torrent}
              isSelected={selectedTorrent === torrent.infoHash}
              onSelect={onSelectTorrent}
              onPause={onPauseTorrent}
              onResume={onResumeTorrent}
              onRemove={onRemoveTorrent}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TorrentTable
