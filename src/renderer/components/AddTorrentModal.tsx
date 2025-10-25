import React, { useState, useEffect } from 'react'
import { X, FolderOpen, Link as LinkIcon, FileText, Check, Minus } from 'lucide-react'

interface AddTorrentModalProps {
  onClose: () => void
  onAddTorrent: (magnetOrPath: string, options?: { selectedFiles?: number[]; path?: string }) => void
  defaultPath: string
}

interface TorrentFile {
  name: string
  length: number
  path: string
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
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [torrentFiles, setTorrentFiles] = useState<TorrentFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set())
  const [showFileSelection, setShowFileSelection] = useState(false)

  const handleSelectFolder = async () => {
    const folder = await window.electron.selectFolder()
    if (folder) {
      setSavePath(folder)
    }
  }

  const handleSelectFile = async () => {
    const files = await window.electron.selectTorrentFile()
    if (files && files.length > 0) {
      files.forEach(file => onAddTorrent(file, { path: savePath }))
      onClose()
    }
  }

  const handleLoadFiles = async () => {
    if (!magnetUrl.trim()) return
    
    setIsLoadingFiles(true)
    try {
      const files = await window.electron.getTorrentFiles(magnetUrl.trim())
      if (files && files.length > 0) {
        setTorrentFiles(files)
        // Select all files by default
        setSelectedFiles(new Set(files.map((_, index) => index)))
        setShowFileSelection(true)
      } else {
        alert('Failed to load torrent files. This could be due to:\n\n1. No peers available\n2. Invalid magnet link\n3. Network/firewall issues\n\nTry adding the torrent without file selection, or try a different torrent.')
      }
    } catch (error) {
      console.error('Failed to load torrent files:', error)
      alert('Error loading torrent metadata. You can still add the torrent without file selection.')
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const toggleFileSelection = (index: number) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedFiles(newSelected)
  }

  const toggleAllFiles = () => {
    if (selectedFiles.size === torrentFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(torrentFiles.map((_, index) => index)))
    }
  }

  const handleSubmit = () => {
    if (activeTab === 'magnet' && magnetUrl.trim()) {
      const selectedIndices = showFileSelection ? Array.from(selectedFiles) : undefined
      onAddTorrent(magnetUrl.trim(), {
        selectedFiles: selectedIndices,
        path: savePath
      })
      onClose()
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
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
            {!showFileSelection ? (
              <>
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

                <div className="flex gap-2">
                  <button 
                    className="btn btn-outline flex-1" 
                    onClick={handleLoadFiles}
                    disabled={!magnetUrl.trim() || isLoadingFiles}
                  >
                    {isLoadingFiles ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <FileText size={18} />
                    )}
                    Select Files
                  </button>
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
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Select Files to Download</h4>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={toggleAllFiles}
                  >
                    {selectedFiles.size === torrentFiles.length ? <Minus size={14} /> : <Check size={14} />}
                    {selectedFiles.size === torrentFiles.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="overflow-auto max-h-64 border border-base-300 rounded-lg">
                  <table className="table table-sm table-pin-rows">
                    <thead>
                      <tr>
                        <th className="w-12"></th>
                        <th>File Name</th>
                        <th className="text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {torrentFiles.map((file, index) => (
                        <tr key={index} className="hover">
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                              checked={selectedFiles.has(index)}
                              onChange={() => toggleFileSelection(index)}
                            />
                          </td>
                          <td className="text-sm">{file.name}</td>
                          <td className="text-right font-mono text-sm">{formatBytes(file.length)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-sm text-base-content/60">
                  {selectedFiles.size} of {torrentFiles.length} files selected
                </div>
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowFileSelection(false)}
                >
                  Back to Settings
                </button>
              </>
            )}
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
