import React, { useState, useEffect } from 'react'
import { Minus, Square, X, Settings } from 'lucide-react'

interface TitleBarProps {
  onSettingsClick: () => void
}

const TitleBar: React.FC<TitleBarProps> = ({ onSettingsClick }) => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.electron.windowIsMaximized().then(setIsMaximized)
  }, [])

  const handleMinimize = () => {
    window.electron.windowMinimize()
  }

  const handleMaximize = () => {
    window.electron.windowMaximize()
    setIsMaximized(!isMaximized)
  }

  const handleClose = () => {
    window.electron.windowClose()
  }

  return (
    <div
      className="h-12 bg-base-200 flex items-center justify-between px-4 select-none border-b border-base-300"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left side - Logo and title */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🐜</span>
        <span className="font-bold text-lg">AntTorrent</span>
      </div>

      {/* Right side - Settings and window controls */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={onSettingsClick}
          title="Settings (Ctrl+,)"
        >
          <Settings size={18} />
        </button>

        <div className="divider divider-horizontal mx-0" />

        <button
          className="btn btn-ghost btn-sm btn-square hover:bg-base-300"
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minus size={18} />
        </button>

        <button
          className="btn btn-ghost btn-sm btn-square hover:bg-base-300"
          onClick={handleMaximize}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          <Square size={14} />
        </button>

        <button
          className="btn btn-ghost btn-sm btn-square hover:bg-error hover:text-error-content"
          onClick={handleClose}
          title="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default TitleBar
