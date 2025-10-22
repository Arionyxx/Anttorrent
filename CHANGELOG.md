# Changelog

All notable changes to AntTorrent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-22

### Added
- Initial release of AntTorrent
- Custom frameless window with modern title bar
- System tray integration with minimize to tray
- Add torrents via magnet links and .torrent files
- Real-time download/upload speed monitoring
- Pause, resume, and remove torrents
- Torrent details panel with tabs (Overview, Files, Peers)
- Comprehensive settings dialog with multiple tabs
  - General settings (download path, startup options)
  - Connection settings (speed limits, DHT, PEX, UPnP)
  - Torrent settings (auto-start, seeding ratio)
  - Appearance settings (theme, view mode)
- Sidebar navigation with status filters
- Search and filter torrents
- Windows notifications on download complete
- Persistent settings using electron-store
- Window state persistence (size, position, maximized)
- DaisyUI dark theme by default
- Keyboard shortcuts (Ctrl+O, Ctrl+V, Space, Delete, etc.)
- Status bar with global download/upload speeds
- Modern UI with Tailwind CSS and DaisyUI components

### Technical Features
- Built with Electron 28
- React 18 with TypeScript
- WebTorrent for torrent functionality
- Vite-based build system (electron-vite)
- Secure IPC with contextBridge
- Type-safe development with TypeScript strict mode
- Windows installer with NSIS

### Known Limitations
- Magnet link protocol handler requires manual registration
- .torrent file associations need to be set up during install
- WebRTC peer connections may require firewall configuration
- No RSS feed support yet
- No speed graphs yet
- Context menu not fully implemented
