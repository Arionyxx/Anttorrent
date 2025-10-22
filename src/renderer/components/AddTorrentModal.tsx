import React, { useState } from 'react'
import { X, FolderOpen, Link as LinkIcon, FileText } from 'lucide-react'

interface AddTorrentModalProps {
  onClose: () => void
  onAddTorrent: (magnetOrPath: string) => void
  defaultPath: string
}

const AddTorrentModal: React.FC<AddTorrentModalProps> = ({
  onClose,
  onAddTorrent,
  defaultPath
}) => {
  const [activeTab, setActiveTab] = useState<'magnet' | 'file'>('magnet')
  const [magnetUrl, setMagnetUrl] = useState('')
  const [savePath, setSavePath] = useState(defaultPath)
  const [startImmediately, setStartImmediately] = useState(true)

  const handleSelectFolder = async () => {
    const folder = await window.electron.selectFolder()
    if (folder) {
      setSavePath(folder)
    }
  }

  const handleSelectFile = async () => {
    const files = await window.electron.selectTorrentFile()
    if (files && files.length > 0) {
      files.forEach(file => onAddTorrent(file))
      onClose()
    }
  }

  const handleSubmit = () => {
    if (activeTab === 'magnet' && magnetUrl.trim()) {
      onAddTorrent(magnetUrl.trim())
      onClose()
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Add Torrent</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="tabs tabs-boxed mb-4">
          <a
            className={`tab ${activeTab === 'magnet' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('magnet')}
          >
            <LinkIcon size={16} className="mr-2" />
            Magnet / URL
          </a>
          <a
            className={`tab ${activeTab === 'file' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <FileText size={16} className="mr-2" />
            File
          </a>
        </div>

        {activeTab === 'magnet' && (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Magnet Link or URL</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="magnet:?xt=urn:btih:..."
                value={magnetUrl}
                onChange={(e) => setMagnetUrl(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Save to</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={savePath}
                  onChange={(e) => setSavePath(e.target.value)}
                  readOnly
                />
                <button className="btn btn-square" onClick={handleSelectFolder}>
                  <FolderOpen size={18} />
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={startImmediately}
                  onChange={(e) => setStartImmediately(e.target.checked)}
                />
                <span className="label-text">Start immediately</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'file' && (
          <div className="space-y-4">
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Click the button below to select .torrent files from your computer.</span>
            </div>

            <button className="btn btn-primary btn-block" onClick={handleSelectFile}>
              <FileText size={18} />
              Browse for Torrent Files...
            </button>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Save to</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={savePath}
                  onChange={(e) => setSavePath(e.target.value)}
                  readOnly
                />
                <button className="btn btn-square" onClick={handleSelectFolder}>
                  <FolderOpen size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          {activeTab === 'magnet' && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!magnetUrl.trim()}
            >
              Add Torrent
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  )
}

export default AddTorrentModal
