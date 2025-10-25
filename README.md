# 🐜 AntTorrent

A modern, beautiful, and feature-rich desktop torrent client built with Electron, React, TypeScript, and DaisyUI.

![AntTorrent](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### Core Torrent Functionality
- 🔥 **Full WebTorrent Integration** - Robust torrent downloading and seeding
- 📊 **Real-time Statistics** - Live download/upload speeds, peer counts, and progress
- 🎯 **Smart Queue Management** - Control simultaneous downloads
- ⚡ **Bandwidth Control** - Set global and per-torrent speed limits
- 🔄 **Auto-Resume** - Automatically resume interrupted downloads
- 💾 **State Persistence** - Torrents survive app restarts
- 📁 **Multi-file Torrents** - Handle complex torrent structures
- 🌍 **DHT, PEX, and UPnP** - Full peer discovery support

### User Interface
- 🎨 **29 Beautiful Themes** - Dark and light themes for every taste
- 🖱️ **Drag & Drop Support** - Drop .torrent files or magnet links anywhere
- 🔍 **Real-time Search** - Instant torrent filtering
- 📋 **Context Menus** - Right-click for quick actions
- 🎭 **Smooth Animations** - Polished, professional feel
- 📱 **Responsive Layout** - Adapts to any window size
- 🎯 **Status Indicators** - Visual feedback for all torrent states
- ✨ **Glow Effects** - Beautiful badge animations

### Desktop Integration
- 🪟 **Custom Title Bar** - Frameless window with full controls
- 🔔 **System Notifications** - Desktop alerts for completed downloads
- 📎 **System Tray** - Minimize to tray with quick controls
- 🚀 **Auto-start** - Launch with Windows/OS
- 🔗 **Protocol Handler** - Magnet link (magnet://) support
- 📁 **File Associations** - Double-click .torrent files to open
- ⌨️ **Global Hotkeys** - Control from anywhere (Ctrl+Alt+T)
- 💾 **Window State Memory** - Remembers size and position

### Advanced Features
- 📊 **Detailed Info Panel** - Comprehensive torrent statistics
- 📁 **File Management** - View and manage individual files
- 🎯 **Smart Filtering** - Filter by status (downloading, seeding, paused)
- 📋 **Clipboard Monitoring** - Detect magnet links automatically
- 🔄 **Batch Operations** - Pause/resume all torrents at once
- 📝 **Ratio Tracking** - Monitor upload/download ratios
- 🗑️ **Safe Removal** - Option to keep or delete files
- ⏱️ **ETA Calculation** - Accurate time remaining estimates

## 🎨 Available Themes

### Dark Themes
- Night (default), Dark, Black, Business, Dracula, Luxury, Coffee, Synthwave, Halloween, Forest

### Light Themes
- Light, Cupcake, Bumblebee, Emerald, Corporate, Retro, Cyberpunk, Valentine, Garden, Aqua, Lofi, Pastel, Fantasy, Wireframe, CMYK, Autumn, Acid, Lemonade, Winter

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/anttorrent.git
cd anttorrent

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Building

```bash
# Build the application
npm run build

# Create installer
npm run package

# Create unpacked distribution
npm run package:dir
```

## 📁 Project Structure

```
anttorrent/
├── src/
│   ├── main/                  # Electron main process
│   │   ├── main.ts           # Main entry point & IPC handlers
│   │   ├── torrentManager.ts # Core torrent logic (NEW!)
│   │   ├── tray.ts           # System tray integration
│   │   └── protocol.ts       # Protocol handlers
│   ├── preload/              # Electron preload scripts
│   │   └── preload.ts        # Secure IPC bridge
│   └── renderer/             # React application
│       ├── components/       # UI components
│       │   ├── TitleBar.tsx
│       │   ├── Sidebar.tsx
│       │   ├── TorrentTable.tsx
│       │   ├── TorrentRow.tsx
│       │   ├── DetailsPanel.tsx
│       │   ├── StatusBar.tsx
│       │   ├── AddTorrentModal.tsx
│       │   ├── SettingsModal.tsx
│       │   └── ContextMenu.tsx  # (NEW!)
│       ├── App.tsx           # Main application
│       ├── types.ts          # TypeScript definitions
│       ├── index.css         # Global styles
│       └── main.tsx          # Entry point
├── resources/                # Application resources
│   ├── icon.ico             # Windows icon
│   └── icon.png             # Generic icon
├── electron.vite.config.ts  # Build configuration
├── tailwind.config.js       # Tailwind + DaisyUI config
├── package.json
└── README.md
```

## ⌨️ Keyboard Shortcuts

### File Operations
- `Ctrl+O` - Open torrent file(s)
- `Ctrl+U` - Add magnet link/URL
- `Ctrl+,` - Open settings

### Torrent Control
- `Space` - Pause/Resume selected torrent
- `Delete` - Remove selected torrent
- `Ctrl+A` - Select all (planned)

### Navigation
- `Ctrl+F` - Focus search box
- `F5` - Refresh torrent list
- `Escape` - Close dialogs

### Window
- `Ctrl+Alt+T` - Show/hide window (global)
- `Alt+F4` - Quit application

## 🔧 Configuration

### Settings Location

Settings are stored locally using `electron-store`:

- **Windows**: `%APPDATA%\anttorrent\config.json`
- **Linux**: `~/.config/anttorrent/config.json`
- **macOS**: `~/Library/Application Support/anttorrent/config.json`

### Available Settings

#### General
- Default download location
- Start with Windows/OS
- Minimize/close to tray
- Notification preferences
- Sound effects

#### Connection
- Max download speed (KB/s)
- Max upload speed (KB/s)
- Max connections per torrent
- DHT, PEX, UPnP toggles

#### Torrents
- Auto-start when added
- Auto-open folder on complete
- Stop seeding at ratio
- Max simultaneous downloads
- Delete .torrent after adding

#### Appearance
- Theme selection (29 options)
- View mode (compact/comfortable/spacious)
- Show/hide details panel

## 🎯 Usage

### Adding Torrents

**Method 1: Drag & Drop**
- Drag .torrent files or magnet links directly onto the window

**Method 2: File Browser**
- Click "Add File" or press `Ctrl+O`
- Select one or more .torrent files

**Method 3: Magnet Link**
- Click "Add Magnet" or press `Ctrl+U`
- Paste magnet link or URL

**Method 4: Protocol Handler**
- Click magnet links in your browser
- AntTorrent opens automatically

### Managing Torrents

**Pause/Resume**
- Click pause/play button in row
- Press `Space` with torrent selected
- Right-click → Pause/Resume

**Remove Torrents**
- Click trash icon in row
- Press `Delete` with torrent selected
- Right-click → Remove options
- Choose to keep or delete files

**View Details**
- Click any torrent to select
- Details panel shows at bottom
- Tabs: Overview, Files, Peers

**Context Menu** (Right-click)
- Pause/Resume
- Open folder
- Copy magnet link
- Copy info hash
- Remove options

## 🏗️ Architecture

### Main Process (src/main/)
The main process handles:
- Window creation and management
- System tray integration
- Protocol handling (magnet links)
- **TorrentManager** - Core torrent operations
- IPC communication with renderer
- Settings persistence

### Renderer Process (src/renderer/)
The renderer process provides:
- React-based UI
- Real-time torrent updates
- User interactions
- Drag & drop handling
- Keyboard shortcuts

### IPC Communication
Secure communication via contextBridge:
- `addTorrent()` - Add new torrent
- `removeTorrent()` - Remove torrent
- `pauseTorrent()` / `resumeTorrent()` - Control torrents
- `getTorrents()` - Get all torrents
- Event listeners for updates

## 🔒 Security

- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Secure IPC via contextBridge
- ✅ WebTorrent runs in main process only
- ✅ All external links open in default browser
- ✅ No eval() or remote content execution

## 🧪 Testing

```bash
# Run development build
npm run dev

# Test installer creation
npm run package:dir

# Full package build
npm run package
```

## 📦 Distribution

The built application includes:
- Windows NSIS installer (.exe)
- Desktop shortcut
- Start menu entry
- File associations
- Uninstaller

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Known Issues

- Streaming playback not yet implemented
- RSS feed support planned
- Torrent creation planned
- Multi-selection planned

## 🗺️ Roadmap

- [ ] Streaming support for media files
- [ ] RSS feed subscriptions
- [ ] Torrent creation tool
- [ ] Multi-selection support
- [ ] Bandwidth scheduler
- [ ] Built-in search
- [ ] Remote control API
- [ ] Mobile app companion

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **WebTorrent** - Amazing torrent engine
- **Electron** - Desktop app framework
- **React** - UI library
- **DaisyUI** - Beautiful components
- **Tailwind CSS** - Utility-first CSS
- **Lucide Icons** - Icon library
- **electron-store** - Settings management

## 💬 Support

- 🐛 [Report Issues](https://github.com/yourusername/anttorrent/issues)
- 💡 [Feature Requests](https://github.com/yourusername/anttorrent/issues)
- 📖 [Documentation](https://github.com/yourusername/anttorrent/wiki)

---

Made with ❤️ using Electron + React + TypeScript

**Note**: This is a complete rewrite with proper torrent functionality. WebTorrent now runs securely in the main process, with full IPC communication for the renderer.
