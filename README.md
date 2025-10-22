# 🐜 AntTorrent

A modern, beautiful Windows desktop torrent client built with Electron, React, TypeScript, and DaisyUI.

## Features

### Windows Desktop Integration
- ✨ Custom title bar with minimize, maximize, and close buttons
- 🎯 System tray integration (minimize to tray, right-click menu)
- 📢 Native Windows notifications
- 🚀 Start with Windows option
- 🔗 Magnet link protocol handler (magnet://)
- 📁 .torrent file associations
- ⌨️ Global hotkey support (Ctrl+Alt+T)
- 💾 Window state persistence

### Torrent Management
- ➕ Add torrents via:
  - Drag & drop .torrent files
  - Drag & drop magnet links
  - File → Open (Ctrl+O)
  - Paste magnet link (Ctrl+V)
- ⏯️ Pause/Resume torrents
- 🗑️ Remove torrents (with or without files)
- 📊 Real-time speed monitoring
- 👥 Peer/seeder information
- 📈 Progress tracking

### User Interface
- 🎨 Modern UI with DaisyUI and Tailwind CSS
- 🌙 Dark theme by default (customizable)
- 📱 Responsive layout with sidebar navigation
- 📋 Detailed torrent information panel
- 🔍 Search and filter torrents
- ⚡ Fast and smooth animations

### Settings
- 📂 Customizable download location
- 🔄 Auto-start with Windows
- 🔔 Notification preferences
- 🌐 Connection settings (DHT, PEX, UPnP)
- 📊 Bandwidth limits
- 🎨 Theme customization

## Tech Stack

- **Electron** - Desktop application framework
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **DaisyUI + Tailwind CSS** - Beautiful component library
- **WebTorrent** - Torrent engine
- **electron-store** - Settings persistence
- **electron-builder** - Windows installer creation

## Development

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the application
npm run build

# Create Windows installer
npm run package
```

### Project Structure

```
src/
├── main/               # Electron main process
│   ├── main.ts        # Main entry point
│   ├── tray.ts        # System tray integration
│   └── protocol.ts    # Protocol handlers (magnet links)
├── preload/           # Electron preload scripts
│   └── preload.ts     # IPC bridge
└── renderer/          # React application
    ├── components/    # UI components
    ├── App.tsx        # Main app component
    ├── types.ts       # TypeScript definitions
    └── main.tsx       # Renderer entry point
```

## Keyboard Shortcuts

- `Ctrl+O` - Open torrent file
- `Ctrl+V` - Add magnet link from clipboard
- `Ctrl+,` - Open settings
- `Ctrl+Alt+T` - Show/hide window (global)
- `Space` - Pause/Resume selected torrent
- `Delete` - Remove selected torrent
- `Ctrl+F` - Focus search
- `F5` - Refresh
- `Alt+F4` - Quit application

## Building for Windows

The application uses `electron-builder` to create Windows installers:

```bash
# Create NSIS installer
npm run package

# Output will be in the release/ directory
```

### Installer Features

- One-click or custom installation directory
- Desktop shortcut creation
- Start Menu integration
- File associations for .torrent files
- Uninstaller with complete cleanup

## Configuration

Settings are stored locally using `electron-store` in:
```
%APPDATA%/anttorrent/config.json
```

## License

This is a demo application created for educational purposes.

## Credits

- Ant emoji 🐜 for the logo
- DaisyUI for the beautiful UI components
- WebTorrent for the torrent engine
- Electron for enabling desktop apps with web technologies
