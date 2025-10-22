# AntTorrent - Project Structure

This document provides an overview of the project's file organization and architecture.

## Root Directory

```
anttorrent/
├── src/                        # Source code
├── dist/                       # Renderer build output (HTML, CSS, JS)
├── dist-electron/              # Main & preload build output
├── resources/                  # Application resources (icons, assets)
├── release/                    # Windows installer output (created by build)
├── node_modules/               # Dependencies
├── package.json                # Project configuration & dependencies
├── tsconfig.json               # TypeScript configuration
├── electron.vite.config.ts     # Vite bundler configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── .gitignore                  # Git ignore rules
├── .editorconfig              # Editor configuration
├── README.md                   # Project documentation
├── DEVELOPMENT.md              # Development guide
├── CHANGELOG.md                # Version history
├── TODO.md                     # Feature roadmap
├── LICENSE                     # MIT License
└── PROJECT_STRUCTURE.md        # This file
```

## Source Code (`src/`)

### Main Process (`src/main/`)
The Electron main process handles system-level operations:

- **main.ts** (298 lines)
  - Application entry point
  - Window creation and management
  - IPC handlers for renderer communication
  - Settings persistence with electron-store
  - Command-line argument handling
  - Single instance lock
  - Window state persistence

- **tray.ts** (70 lines)
  - System tray icon creation
  - Tray context menu
  - Show/hide window from tray
  - Real-time stats display in tray menu

- **protocol.ts** (18 lines)
  - Magnet link protocol handler registration
  - Sets app as default handler for `magnet://` URLs

### Preload Script (`src/preload/`)

- **preload.ts** (60 lines)
  - Secure IPC bridge using contextBridge
  - Exposes safe APIs to renderer process
  - No direct Node.js access from renderer
  - Type-safe API definitions

### Renderer Process (`src/renderer/`)
React application running in Chromium:

#### Core Files
- **App.tsx** (350+ lines)
  - Main application component
  - Torrent state management
  - WebTorrent client integration
  - Event handlers for all torrent operations
  - Global keyboard shortcuts
  - Tray integration

- **main.tsx** (10 lines)
  - Renderer entry point
  - React root mounting

- **index.html** (13 lines)
  - HTML template
  - Sets theme attribute

- **index.css** (60 lines)
  - Global styles
  - Tailwind imports
  - Custom scrollbar styles
  - Smooth transitions

- **types.ts** (80 lines)
  - TypeScript type definitions
  - TorrentData interface
  - Settings interface
  - Global window.electron API types

#### Components (`src/renderer/components/`)

1. **TitleBar.tsx** (~65 lines)
   - Custom window controls (min, max, close)
   - Settings button
   - Drag region for window movement
   - Maximize state management

2. **Sidebar.tsx** (~55 lines)
   - Navigation menu
   - Status filters (All, Downloading, Completed, etc.)
   - Badge counters for each category
   - Icon-based navigation

3. **TorrentTable.tsx** (~75 lines)
   - Table container component
   - Empty state handling
   - Column headers
   - Maps torrent data to rows

4. **TorrentRow.tsx** (~130 lines)
   - Individual torrent display
   - Progress bar
   - Action buttons (play, pause, remove)
   - Speed and peer information
   - Status badges
   - Context menu trigger

5. **DetailsPanel.tsx** (~150 lines)
   - Tabbed interface (Overview, Files, Peers)
   - Torrent metadata display
   - File list with progress
   - Peer information placeholder

6. **AddTorrentModal.tsx** (~120 lines)
   - DaisyUI modal dialog
   - Magnet link / File tabs
   - Download location selector
   - Auto-start checkbox

7. **SettingsModal.tsx** (~350 lines)
   - Large tabbed settings dialog
   - General, Connection, Torrents, Appearance tabs
   - Form controls for all settings
   - Folder picker integration
   - Theme selector

8. **StatusBar.tsx** (~35 lines)
   - Bottom status bar
   - Global download/upload speeds
   - Active torrent count
   - Compact display

## Resource Files (`resources/`)

- **icon.png** - Application icon (placeholder, needs real 256x256 PNG)
- **icon.ico** - Windows icon (placeholder, needs real multi-size .ico)

## Build Output

### Development Build
When running `npm run dev`, Vite serves files from memory with hot-reload.

### Production Build (`npm run build`)

**dist-electron/main/main.js**
- Compiled main process (Node.js)
- ~8.5 KB

**dist-electron/preload/preload.js**
- Compiled preload script
- ~1.7 KB

**dist/index.html**
- HTML entry point
- ~0.4 KB

**dist/assets/index-[hash].css**
- Bundled CSS (Tailwind + DaisyUI)
- ~79 KB

**dist/assets/index-[hash].js**
- Bundled JavaScript (React + app code + WebTorrent)
- ~283 KB

### Installer Build (`npm run package`)

Creates NSIS installer in `release/` directory:
- `AntTorrent Setup 1.0.0.exe` - Windows installer
- Includes all dependencies and assets
- File associations for .torrent files
- Desktop and Start Menu shortcuts

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           Electron Main Process                  │
│  ┌────────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  main.ts   │  │ tray.ts  │  │ protocol.ts │ │
│  └────────────┘  └──────────┘  └─────────────┘ │
│         │                                        │
│         │ IPC (ipcMain)                         │
│         │                                        │
├─────────┼────────────────────────────────────────┤
│         │                                        │
│  ┌──────▼──────┐                                │
│  │ preload.ts  │  (contextBridge)               │
│  └──────┬──────┘                                │
│         │                                        │
│         │ window.electron API                   │
│         │                                        │
├─────────┼────────────────────────────────────────┤
│         │                                        │
│  ┌──────▼──────┐   Electron Renderer Process    │
│  │   App.tsx   │                                │
│  └──────┬──────┘                                │
│         │                                        │
│    ┌────┴─────┬──────────┬──────────┐          │
│    ▼          ▼          ▼          ▼          │
│ TitleBar  Sidebar  TorrentTable  DetailsPanel  │
│                                                  │
│  WebTorrent Client (torrent operations)        │
└──────────────────────────────────────────────────┘
```

## Data Flow

### Adding a Torrent
1. User clicks "Add Torrent" button in UI
2. `AddTorrentModal` component appears
3. User enters magnet link or selects file
4. Modal calls `handleAddTorrent(magnetOrPath)`
5. `App.tsx` passes to WebTorrent: `client.add(magnetOrPath)`
6. WebTorrent begins downloading
7. `updateTorrents()` runs every 1 second
8. React state updates
9. UI re-renders with new data

### Settings Persistence
1. User changes setting in `SettingsModal`
2. Modal calls `onSave(newSettings)`
3. `App.tsx` calls `window.electron.setSettings()`
4. Preload forwards to main process via IPC
5. Main process saves to electron-store
6. Settings file updated: `%APPDATA%/anttorrent/config.json`

### System Tray
1. Main process creates tray in `createTray()`
2. Renderer updates stats every second
3. `window.electron.updateTrayStats()` called
4. Main process updates tray menu via `updateTrayMenu()`
5. User clicks tray menu item
6. Main process sends IPC to renderer
7. Renderer handles action (pause all, etc.)

## Key Design Decisions

### Why Frameless Window?
- Modern, native look
- Custom branding with app logo
- Consistent across Windows versions
- Full control over title bar styling

### Why WebTorrent?
- Pure JavaScript implementation
- Works in Electron without native dependencies
- Active development and community
- WebRTC for peer connections

### Why DaisyUI?
- Pre-built component library
- Consistent design system
- Dark theme out of the box
- Fast development

### Why electron-store?
- Simple JSON-based storage
- Atomic writes (safe)
- Type-safe with TypeScript
- Default values support

### Why Separate Processes?
- Security: Renderer isolated from Node.js
- Stability: Crash in renderer doesn't kill main
- Performance: Main process not blocked by UI
- Best practice for Electron apps

## Testing the Structure

Run these commands to verify the structure:

```bash
# Verify source files exist
find src -type f -name "*.ts" -o -name "*.tsx"

# Check build outputs
npm run build && ls -lh dist/ dist-electron/

# Verify all components
ls -1 src/renderer/components/

# Check configuration files
ls -1 *.config.* package.json tsconfig.json
```

## Metrics

- **Total Source Files**: ~20 TypeScript/TSX files
- **Lines of Code**: ~2,500+ (excluding node_modules)
- **Components**: 8 React components
- **Main Process Modules**: 3 files
- **Build Output Size**: ~370 KB (gzipped would be ~90 KB)
- **Dependencies**: 30+ npm packages
- **Dev Dependencies**: 20+ npm packages

## Next Steps for Development

1. Implement context menus (right-click)
2. Add drag-and-drop for files
3. Persist torrent list between sessions
4. Add speed graphs
5. Implement bandwidth scheduler
6. Add RSS feed support
7. Create real application icons
8. Test on real Windows machines
9. Optimize performance for 100+ torrents
10. Add comprehensive error handling

---

For detailed development instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).
For feature roadmap, see [TODO.md](TODO.md).
