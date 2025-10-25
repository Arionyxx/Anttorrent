# Build Instructions for AntTorrent

## Prerequisites
- Node.js 18+ and npm
- Git
- Windows (for building Windows executables)

## Building the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```
This compiles both the main process (Electron) and renderer process (React) code.

### 3. Package for Windows

#### Create Windows Installer (NSIS)
```bash
npm run package
```

This will:
- Build the application
- Create a Windows installer (.exe)
- Output files to `release/` directory

The installer will be named something like:
- `AntTorrent Setup 1.0.0.exe`

#### Create Portable Version (Directory only)
```bash
npm run package:dir
```

This creates an unpacked version in `release/win-unpacked/` that can be run without installation.

## Output Files

After building, you'll find:
- **Installer**: `release/AntTorrent Setup 1.0.0.exe`
- **Portable**: `release/win-unpacked/AntTorrent.exe`
- **Build artifacts**: `release/` directory

## Creating a GitHub Release

### Manual Method
1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag version (e.g., `v1.0.0`)
4. Upload the installer from `release/` folder
5. Write release notes
6. Publish release

### Using GitHub CLI
```bash
# Create a new release
gh release create v1.0.0 \
  release/AntTorrent*.exe \
  --title "AntTorrent v1.0.0" \
  --notes "Release notes here"
```

## Troubleshooting

### Build Fails
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist dist-electron`

### Electron Builder Issues
- Make sure you're on Windows when building Windows executables
- Check that `resources/icon.ico` exists
- Verify all paths in `package.json` under `build` config

### Missing Dependencies
```bash
npm install --force
```

## Development Mode

To run the app in development mode (with hot reload):
```bash
npm run dev
```

## File Association

The built installer automatically associates `.torrent` files with AntTorrent and registers the `magnet:` protocol handler.
