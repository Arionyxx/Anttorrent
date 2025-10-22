import React, { useState } from 'react'
import { TorrentData } from '../types'

interface DetailsPanelProps {
  torrent: TorrentData
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ torrent }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'peers'>('overview')

  return (
    <div className="h-64 border-t border-base-300 bg-base-200">
      <div className="tabs tabs-boxed bg-base-200 px-4 pt-2">
        <a
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </a>
        <a
          className={`tab ${activeTab === 'files' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files ({torrent.files.length})
        </a>
        <a
          className={`tab ${activeTab === 'peers' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('peers')}
        >
          Peers ({torrent.numPeers})
        </a>
      </div>

      <div className="overflow-auto h-[calc(100%-3rem)] p-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-base-content/60">Name</div>
              <div className="font-medium">{torrent.name}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/60">Size</div>
              <div className="font-medium font-mono">{formatBytes(torrent.size)}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/60">Downloaded</div>
              <div className="font-medium font-mono">{formatBytes(torrent.downloaded)}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/60">Uploaded</div>
              <div className="font-medium font-mono">{formatBytes(torrent.uploaded)}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/60">Ratio</div>
              <div className="font-medium font-mono">{torrent.ratio.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/60">Peers</div>
              <div className="font-medium">{torrent.numPeers}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/60">Download Speed</div>
              <div className="font-medium font-mono text-info">{formatSpeed(torrent.downloadSpeed)}</div>
            </div>
            <div>
              <div className="text-sm text-base-content/60">Upload Speed</div>
              <div className="font-medium font-mono text-success">{formatSpeed(torrent.uploadSpeed)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-base-content/60">Save Path</div>
              <div className="font-medium text-sm break-all">{torrent.path || 'Unknown'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-base-content/60">Info Hash</div>
              <div className="font-mono text-xs break-all">{torrent.infoHash}</div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="text-right">Size</th>
                  <th className="text-center">Progress</th>
                </tr>
              </thead>
              <tbody>
                {torrent.files.map((file, index) => (
                  <tr key={index}>
                    <td className="text-sm">{file.name}</td>
                    <td className="text-right font-mono text-sm">{formatBytes(file.length)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <progress
                          className="progress progress-primary w-24"
                          value={file.progress * 100}
                          max="100"
                        />
                        <span className="text-sm font-mono">{Math.round(file.progress * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'peers' && (
          <div className="text-center text-base-content/60 py-8">
            <p>Peer information would be displayed here</p>
            <p className="text-sm mt-2">Connected to {torrent.numPeers} peers</p>
          </div>
        )}
      </div>
    </div>
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

export default DetailsPanel
