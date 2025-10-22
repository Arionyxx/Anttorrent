import React from 'react'
import { Download, CheckCircle, Upload, Pause, List } from 'lucide-react'
import { TorrentData } from '../types'

interface SidebarProps {
  filter: string
  onFilterChange: (filter: string) => void
  torrents: TorrentData[]
}

const Sidebar: React.FC<SidebarProps> = ({ filter, onFilterChange, torrents }) => {
  const counts = {
    all: torrents.length,
    downloading: torrents.filter(t => t.status === 'downloading').length,
    completed: torrents.filter(t => t.status === 'seeding' || t.progress === 1).length,
    seeding: torrents.filter(t => t.status === 'seeding').length,
    paused: torrents.filter(t => t.status === 'paused').length
  }

  const items = [
    { id: 'all', label: 'All Torrents', icon: List, count: counts.all, color: '' },
    { id: 'downloading', label: 'Downloading', icon: Download, count: counts.downloading, color: 'badge-info' },
    { id: 'completed', label: 'Completed', icon: CheckCircle, count: counts.completed, color: 'badge-success' },
    { id: 'seeding', label: 'Seeding', icon: Upload, count: counts.seeding, color: 'badge-success' },
    { id: 'paused', label: 'Paused', icon: Pause, count: counts.paused, color: 'badge-warning' }
  ]

  return (
    <div className="w-64 bg-base-200 border-r border-base-300 p-4">
      <ul className="menu menu-sm gap-1">
        {items.map(item => (
          <li key={item.id}>
            <a
              className={filter === item.id ? 'active' : ''}
              onClick={() => onFilterChange(item.id)}
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              <span className={`badge badge-sm ${item.color}`}>
                {item.count}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar
