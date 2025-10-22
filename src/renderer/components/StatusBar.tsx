import React from 'react'
import { GlobalStats } from '../types'

interface StatusBarProps {
  stats: GlobalStats
}

const StatusBar: React.FC<StatusBarProps> = ({ stats }) => {
  return (
    <div className="h-8 bg-base-200 border-t border-base-300 px-4 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="text-info">↓</span>
          <span className="font-mono">{formatSpeed(stats.downloadSpeed)}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-success">↑</span>
          <span className="font-mono">{formatSpeed(stats.uploadSpeed)}</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>{stats.numActive} Active</span>
      </div>
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

export default StatusBar
