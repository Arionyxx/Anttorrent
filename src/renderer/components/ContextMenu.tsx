import React, { useEffect, useRef } from 'react'
import { Play, Pause, Trash2, FolderOpen, Copy, Link, FileText } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  torrent: {
    infoHash: string
    name: string
    magnetURI: string
    path: string
    status: string
  }
  onPause: () => void
  onResume: () => void
  onRemove: (deleteFiles: boolean) => void
  onOpenFolder: () => void
  onCopyMagnet: () => void
  onCopyHash: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  torrent,
  onPause,
  onResume,
  onRemove,
  onOpenFolder,
  onCopyMagnet,
  onCopyHash
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-base-200 rounded-lg shadow-xl border border-base-300 py-2 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      <ul className="menu menu-sm p-0">
        {torrent.status === 'paused' ? (
          <li>
            <a onClick={() => { onResume(); onClose() }}>
              <Play size={16} />
              Resume
            </a>
          </li>
        ) : (
          <li>
            <a onClick={() => { onPause(); onClose() }}>
              <Pause size={16} />
              Pause
            </a>
          </li>
        )}
        
        <div className="divider my-1"></div>

        <li>
          <a onClick={() => { onOpenFolder(); onClose() }}>
            <FolderOpen size={16} />
            Open Folder
          </a>
        </li>

        <div className="divider my-1"></div>

        <li>
          <a onClick={() => { onCopyMagnet(); onClose() }}>
            <Link size={16} />
            Copy Magnet Link
          </a>
        </li>

        <li>
          <a onClick={() => { onCopyHash(); onClose() }}>
            <FileText size={16} />
            Copy Info Hash
          </a>
        </li>

        <div className="divider my-1"></div>

        <li>
          <a onClick={() => { onRemove(false); onClose() }} className="text-error">
            <Trash2 size={16} />
            Remove Torrent
          </a>
        </li>

        <li>
          <a onClick={() => { onRemove(true); onClose() }} className="text-error">
            <Trash2 size={16} />
            Remove & Delete Files
          </a>
        </li>
      </ul>
    </div>
  )
}

export default ContextMenu
