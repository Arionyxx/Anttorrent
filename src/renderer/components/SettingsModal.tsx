import React, { useState } from 'react'
import { X, FolderOpen } from 'lucide-react'
import { Settings } from '../types'

interface SettingsModalProps {
  settings: Settings
  onClose: () => void
  onSave: (settings: Settings) => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'connection' | 'torrents' | 'appearance'>('general')
  const [localSettings, setLocalSettings] = useState<Settings>(settings)

  const handleSelectFolder = async () => {
    const folder = await window.electron.selectFolder()
    if (folder) {
      setLocalSettings({ ...localSettings, downloadPath: folder })
    }
  }

  const handleSave = () => {
    onSave(localSettings)
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Settings</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Tabs sidebar */}
          <ul className="menu menu-sm bg-base-200 rounded-box w-48 p-2">
            <li>
              <a
                className={activeTab === 'general' ? 'active' : ''}
                onClick={() => setActiveTab('general')}
              >
                General
              </a>
            </li>
            <li>
              <a
                className={activeTab === 'connection' ? 'active' : ''}
                onClick={() => setActiveTab('connection')}
              >
                Connection
              </a>
            </li>
            <li>
              <a
                className={activeTab === 'torrents' ? 'active' : ''}
                onClick={() => setActiveTab('torrents')}
              >
                Torrents
              </a>
            </li>
            <li>
              <a
                className={activeTab === 'appearance' ? 'active' : ''}
                onClick={() => setActiveTab('appearance')}
              >
                Appearance
              </a>
            </li>
          </ul>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto pr-2">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Default Download Location</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1"
                      value={localSettings.downloadPath}
                      readOnly
                    />
                    <button className="btn btn-square" onClick={handleSelectFolder}>
                      <FolderOpen size={18} />
                    </button>
                  </div>
                </div>

                <div className="divider" />

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.startWithWindows}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, startWithWindows: e.target.checked })
                      }
                    />
                    <span className="label-text">Start with Windows</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.minimizeToTray}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, minimizeToTray: e.target.checked })
                      }
                    />
                    <span className="label-text">Minimize to system tray</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.closeToTray}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, closeToTray: e.target.checked })
                      }
                    />
                    <span className="label-text">Close to system tray (don't quit)</span>
                  </label>
                </div>

                <div className="divider" />

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.showNotifications}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, showNotifications: e.target.checked })
                      }
                    />
                    <span className="label-text">Show notification on download complete</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.playSound}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, playSound: e.target.checked })
                      }
                    />
                    <span className="label-text">Play sound on complete</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'connection' && (
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Max Download Speed (KB/s)</span>
                    <span className="label-text-alt">0 = unlimited</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={localSettings.maxDownloadSpeed}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, maxDownloadSpeed: Number(e.target.value) })
                    }
                    min="0"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Max Upload Speed (KB/s)</span>
                    <span className="label-text-alt">0 = unlimited</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={localSettings.maxUploadSpeed}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, maxUploadSpeed: Number(e.target.value) })
                    }
                    min="0"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Max Connections Per Torrent</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={localSettings.maxConnectionsPerTorrent}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, maxConnectionsPerTorrent: Number(e.target.value) })
                    }
                    min="1"
                  />
                </div>

                <div className="divider" />

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.enableDHT}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, enableDHT: e.target.checked })
                      }
                    />
                    <span className="label-text">Enable DHT</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.enablePEX}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, enablePEX: e.target.checked })
                      }
                    />
                    <span className="label-text">Enable PEX</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.enableUPnP}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, enableUPnP: e.target.checked })
                      }
                    />
                    <span className="label-text">Enable UPnP</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'torrents' && (
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.autoStartTorrents}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, autoStartTorrents: e.target.checked })
                      }
                    />
                    <span className="label-text">Auto-start torrents when added</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.autoOpenFolder}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, autoOpenFolder: e.target.checked })
                      }
                    />
                    <span className="label-text">Auto-open folder when complete</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.deleteAfterAdding}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, deleteAfterAdding: e.target.checked })
                      }
                    />
                    <span className="label-text">Delete .torrent file after adding</span>
                  </label>
                </div>

                <div className="divider" />

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Stop seeding at ratio</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={localSettings.stopSeedingAtRatio}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, stopSeedingAtRatio: Number(e.target.value) })
                    }
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Max simultaneous downloads</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={localSettings.maxSimultaneousDownloads}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, maxSimultaneousDownloads: Number(e.target.value) })
                    }
                    min="1"
                  />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Theme</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={localSettings.theme}
                    onChange={(e) => {
                      const newTheme = e.target.value
                      setLocalSettings({ ...localSettings, theme: newTheme })
                      // Preview theme immediately
                      document.documentElement.setAttribute('data-theme', newTheme)
                    }}
                  >
                    <optgroup label="Dark Themes">
                      <option value="night">Night</option>
                      <option value="dark">Dark</option>
                      <option value="black">Black</option>
                      <option value="business">Business</option>
                      <option value="dracula">Dracula</option>
                      <option value="luxury">Luxury</option>
                      <option value="coffee">Coffee</option>
                      <option value="synthwave">Synthwave</option>
                      <option value="halloween">Halloween</option>
                      <option value="forest">Forest</option>
                    </optgroup>
                    <optgroup label="Light Themes">
                      <option value="light">Light</option>
                      <option value="cupcake">Cupcake</option>
                      <option value="bumblebee">Bumblebee</option>
                      <option value="emerald">Emerald</option>
                      <option value="corporate">Corporate</option>
                      <option value="retro">Retro</option>
                      <option value="cyberpunk">Cyberpunk</option>
                      <option value="valentine">Valentine</option>
                      <option value="garden">Garden</option>
                      <option value="aqua">Aqua</option>
                      <option value="lofi">Lofi</option>
                      <option value="pastel">Pastel</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="wireframe">Wireframe</option>
                      <option value="cmyk">CMYK</option>
                      <option value="autumn">Autumn</option>
                      <option value="acid">Acid</option>
                      <option value="lemonade">Lemonade</option>
                      <option value="winter">Winter</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">View Mode</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={localSettings.viewMode}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, viewMode: e.target.value as any })
                    }
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <div className="divider" />

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={localSettings.showDetailsPanel}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, showDetailsPanel: e.target.checked })
                      }
                    />
                    <span className="label-text">Show details panel by default</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  )
}

export default SettingsModal
