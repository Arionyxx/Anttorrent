# AntTorrent - Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm (comes with Node.js)
- Windows 10/11 (for full testing of Windows features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd anttorrent

# Install dependencies
npm install
```

## Development Workflow

### Running in Development Mode

```bash
# Start the app with hot-reload
npm run dev
```

This will:
- Start Vite dev server for the renderer process
- Compile main and preload scripts
- Launch Electron with hot-reload enabled
- Open DevTools automatically

### Building for Production

```bash
# Build all parts (main, preload, renderer)
npm run build

# Test the production build
npm start
```

### Creating Windows Installer

```bash
# Create NSIS installer
npm run package

# Create unpacked directory (faster for testing)
npm run package:dir
```

The installer will be created in the `release/` directory.

## Project Structure

```
anttorrent/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry, window management, IPC handlers
│   │   ├── tray.ts        # System tray integration
│   │   └── protocol.ts    # Magnet link protocol handler
│   ├── preload/           # Electron preload scripts
│   │   └── preload.ts     # Secure IPC bridge (contextBridge)
│   └── renderer/          # React frontend
│       ├── components/    # React components
│       ├── App.tsx        # Main app component
│       ├── types.ts       # TypeScript type definitions
│       ├── main.tsx       # Renderer entry point
│       ├── index.css      # Global styles
│       └── index.html     # HTML template
├── resources/             # App resources (icons, etc.)
├── dist/                  # Renderer build output
├── dist-electron/         # Main & preload build output
├── release/               # Windows installer output
└── package.json           # Project configuration
```

## Key Technologies

### Electron
- **Main Process**: Node.js environment, handles system integration
- **Renderer Process**: Chromium browser, runs React app
- **Preload Script**: Secure bridge using contextBridge

### Frontend Stack
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library built on Tailwind
- **Vite**: Fast build tool and dev server

### Torrent Engine
- **WebTorrent**: JavaScript torrent client
  - Uses WebRTC for peer connections
  - Works in Electron with nodeIntegration
  - DHT, PEX, and tracker support

### Data Persistence
- **electron-store**: Settings and state persistence
  - Stored in: `%APPDATA%/anttorrent/config.json` (Windows)
  - Uses JSON file format
  - Atomic writes to prevent corruption

## Architecture

### IPC Communication

The app uses Electron's IPC (Inter-Process Communication) to communicate between main and renderer:

```
Renderer (React)
    ↓ window.electron.* (contextBridge API)
Preload Script
    ↓ ipcRenderer.invoke / send
Main Process
```

**Example Flow:**
1. User clicks "Open Folder" button
2. React calls `window.electron.selectFolder()`
3. Preload forwards to main via `ipcRenderer.invoke('select-folder')`
4. Main shows native dialog: `dialog.showOpenDialog()`
5. Result is returned through the IPC chain

### State Management

- **Torrent State**: Managed in `App.tsx` using React hooks
- **Settings**: Stored using electron-store, loaded on startup
- **Window State**: Persisted between sessions (size, position, maximized)

### Security Model

- **contextIsolation: true**: Renderer cannot access Node.js APIs directly
- **nodeIntegration: true**: Required for WebTorrent to work
- **Preload Script**: Exposes only specific, safe APIs to renderer
- **No eval()**: Vite CSP-compliant build

## Common Development Tasks

### Adding a New IPC Handler

1. **Define in preload** (`src/preload/preload.ts`):
```typescript
contextBridge.exposeInMainWorld('electron', {
  myNewFunction: (arg: string) => ipcRenderer.invoke('my-channel', arg)
})
```

2. **Handle in main** (`src/main/main.ts`):
```typescript
ipcMain.handle('my-channel', async (_, arg: string) => {
  // Do something
  return result
})
```

3. **Use in renderer** (`src/renderer/App.tsx`):
```typescript
const result = await window.electron.myNewFunction('hello')
```

4. **Update types** (`src/renderer/types.ts`):
```typescript
declare global {
  interface Window {
    electron: {
      myNewFunction: (arg: string) => Promise<any>
    }
  }
}
```

### Adding a New React Component

1. Create component file in `src/renderer/components/`
2. Use TypeScript and functional components
3. Import from `App.tsx` or other components
4. Use DaisyUI classes for styling

### Modifying the Title Bar

Edit `src/renderer/components/TitleBar.tsx`. Remember to keep the drag region styles.

### Adding Settings

1. Update default settings in `src/main/main.ts` (store defaults)
2. Update Settings interface in `src/renderer/types.ts`
3. Add UI controls in `src/renderer/components/SettingsModal.tsx`
4. Apply settings where needed

## Debugging

### Renderer Process
- Press `F12` to open DevTools in development mode
- Use React DevTools extension
- Console.log in renderer code appears in DevTools

### Main Process
- Use `console.log()` in main process code
- Output appears in terminal where you ran `npm run dev`
- Or use VS Code debugger with Electron

### Common Issues

**WebTorrent not working:**
- Ensure `nodeIntegration: true` in BrowserWindow
- Check WebTorrent peer connections aren't blocked by firewall

**IPC not working:**
- Verify preload script is loaded: check in DevTools console
- Ensure handler is registered before window is created
- Check channel names match exactly

**Build fails:**
- Clear build cache: `rm -rf dist dist-electron out`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Testing

### Manual Testing Checklist

- [ ] App launches without errors
- [ ] Custom title bar works (min, max, close)
- [ ] System tray icon appears
- [ ] Add torrent via magnet link
- [ ] Pause/resume torrent
- [ ] Remove torrent
- [ ] Settings persist after restart
- [ ] Theme changes work
- [ ] Window state persists (size, position)

### Testing with Real Torrents

Use these legal test torrents:
- Ubuntu ISO: https://ubuntu.com/download/alternative-downloads
- Debian ISO: https://www.debian.org/CD/torrent-cd/
- Creative Commons media: https://archive.org/

## Performance Tips

- Update torrent list at reasonable intervals (1 second)
- Use React.memo for expensive components
- Implement virtualization for large torrent lists
- Avoid unnecessary re-renders

## Contributing

1. Follow existing code style
2. Use TypeScript strictly
3. Use DaisyUI components (don't write custom CSS)
4. Add types for all functions
5. Test thoroughly before committing

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [WebTorrent API](https://webtorrent.io/docs)
- [DaisyUI Components](https://daisyui.com/components/)
- [Tailwind CSS](https://tailwindcss.com/docs)
