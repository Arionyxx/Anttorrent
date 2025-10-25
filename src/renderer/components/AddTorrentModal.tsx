import React, { useState, useEffect } from 'react'
import { X, FolderOpen, Link as LinkIcon, FileText, Loader } from 'lucide-react'

interface AddTorrentModalProps {
  onClose: () => void
  onAddTorrent: (magnetOrPath: string, savePath: string, selectedFiles?: number[]) => void
  defaultPath: string
}

interface TorrentFile {
  name: string
  length: number
  path: string
  selected: boolean
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
  const [torrentFiles, setTorrentFiles] = useState<TorrentFile[]>([])
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [metadataError, setMetadataError] = useState('')
  const [torrentName, setTorrentName] = useState('')

  const handleSelectFolder = async () => {
    const folder = await window.electron.selectFolder()
    if (folder) {
      setSavePath(folder)
    }
  }

  const handleSelectFile = async () => {
    const files = await window.electron.selectTorrentFile()
    if (files && files.length > 0) {
      // For now, just add them with the selected path
      for (const file of files) {
        onAddTorrent(file, savePath)
      }
      onClose()
    }
  }

  const handleFetchMetadata = async () => {
    if (!magnetUrl.trim()) return

    setLoadingMetadata(true)
    setMetadataError('')
    setTorrentFiles([])

    try {
      const result = await window.electron.getTorrentMetadata(magnetUrl.trim())
      
      if (result.success && result.metadata) {
        setTorrentName(result.metadata.name)
        setTorrentFiles(
          result.metadata.files.map(file => ({
            ...file,
            selected: true // All files selected by default
          }))
        )
      } else {
        setMetadataError(result.error || 'Failed to fetch torrent metadata')
      }
    } catch (err: any) {
      setMetadataError(err.message || 'Failed to fetch torrent metadata')
    } finally {
      setLoadingMetadata(false)
    }
  }

  const handleSubmit = async () => {
    if (activeTab === 'magnet' && magnetUrl.trim()) {
      const selectedIndices = torrentFiles
        .map((f, i) => (f.selected ? i : -1))
        .filter(i => i !== -1)
      
      // Use the new addTorrentWithFiles method if files are selected
      if (torrentFiles.length > 0 && selectedIndices.length < torrentFiles.length) {
        const result = await window.electron.addTorrentWithFiles(magnetUrl.trim(), {
          path: savePath,
          fileIndices: selectedIndices
        })
        
        if (result.success) {
          if (window.electron.showNotification) {
            window.electron.showNotification({
              title: 'Torrent Added',
              body: `${torrentName || 'Download'} started with ${selectedIndices.length} files`
            })
          }
          onClose()
        } else {
          setMetadataError(result.error || 'Failed to add torrent')
        }
      } else {
        // Add all files
        onAddTorrent(magnetUrl.trim(), savePath)
        onClose()
      }
    }
  }

  const toggleFileSelection = (index: number) => {
    setTorrentFiles(prev => 
      prev.map((file, i) => 
        i === index ? { ...file, selected: !file.selected } : file
      )
    )
  }

  const toggleAllFiles = () => {
    const allSelected = torrentFiles.every(f => f.selected)
    setTorrentFiles(prev => 
      prev.map(file => ({ ...file, selected: !allSelected }))
    )
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
      <div className="modal-box max-w-4xl max-h-[90vh]">
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
              <div className="flex gap-2">
                <textarea
                  className="textarea textarea-bordered h-24 flex-1"
                  placeholder="magnet:?xt=urn:btih:..."
                  value={magnetUrl}
                  onChange={(e) => setMagnetUrl(e.target.value)}
                  autoFocus
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleFetchMetadata}
                  disabled={!magnetUrl.trim() || loadingMetadata}
                >
                  {loadingMetadata ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Get Files'
                  )}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt">Paste magnet link and click "Get Files" to select which files to download</span>
              </label>
            </div>

            {metadataError && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{metadataError}</span>
              </div>
            )}

            {loadingMetadata && (
              <div className="alert alert-info">
                <Loader size={20} className="animate-spin" />
                <span>Fetching torrent metadata... This may take a few seconds.</span>
              </div>
            )}

            {torrentFiles.length > 0 && (
              <div className="border border-base-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">
                    {torrentName && <div className="text-sm text-base-content/70 mb-1">{torrentName}</div>}
                    Select Files to Download
                  </h4>
                  <button className="btn btn-xs" onClick={toggleAllFiles}>
                    {torrentFiles.every(f => f.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {torrentFiles.map((file, index) => (
                    <label key={index} className="flex items-center gap-2 py-2 hover:bg-base-200 px-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={file.selected}
                        onChange={() => toggleFileSelection(index)}
                      />
                      <div className="flex-1">
                        <div className="text-sm">{file.name}</div>
                        <div className="text-xs text-base-content/60">{formatBytes(file.length)}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-sm text-base-content/60">
                  {torrentFiles.filter(f => f.selected).length} of {torrentFiles.length} files selected
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Save to</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={savePath}
                  readOnly
                />
                <button className="btn btn-square" onClick={handleSelectFolder}>
                  <FolderOpen size={18} />
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt">Choose where to save the downloaded files</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={startImmediately}
                  onChange={(e) => setStartImmediately(e.target.checked)}
                />
                <span className="label-text">Start download immediately</span>
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
                <span className="label-text font-semibold">Save to</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={savePath}
                  readOnly
                />
                <button className="btn btn-square" onClick={handleSelectFolder}>
                  <FolderOpen size={18} />
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt">Choose where to save the downloaded files</span>
              </label>
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
              disabled={!magnetUrl.trim() || loadingMetadata}
            >
              {torrentFiles.length > 0 
                ? `Add ${torrentFiles.filter(f => f.selected).length} Selected Files`
                : 'Add Torrent'}
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  )
}

export default AddTorrentModal
