# Release Guide for AntTorrent

## Quick Start: Building for Windows

### Prerequisites
```bash
# Install Node.js (18+) from nodejs.org
# Clone the repository
git clone https://github.com/Arionyxx/Anttorrent.git
cd Anttorrent

# Checkout the feature branch
git checkout feature/selective-file-download
```

### Build Steps

#### 1. Install Dependencies (First Time Only)
```bash
npm install
```
This may take 5-10 minutes.

#### 2. Build the Application
```bash
npm run build
```
Compiles TypeScript and bundles the app (~30 seconds).

#### 3. Create Windows Installer
```bash
npm run package
```
Creates the installer (~2-3 minutes).

**Output**: `release/AntTorrent Setup 1.0.0.exe` (~150-200 MB)

#### Alternative: Portable Version
```bash
npm run package:dir
```
**Output**: `release/win-unpacked/AntTorrent.exe`

## Creating a GitHub Release

### Method 1: Using GitHub Web Interface

1. Go to: https://github.com/Arionyxx/Anttorrent/releases
2. Click "Draft a new release"
3. Fill in:
   - **Tag**: `v1.1.0` (or next version)
   - **Title**: `AntTorrent v1.1.0 - Selective File Download`
   - **Description**:
   ```markdown
   ## What's New
   
   ### ✨ Selective File Download
   - Choose which files to download from a torrent
   - Unselected files are created as 0KB placeholders
   - Save bandwidth and disk space
   - File selection is remembered across sessions
   
   ### Features
   - Preview file list before downloading
   - Select/Deselect all files with one click
   - See file sizes in the selection UI
   - Maintain folder structure with placeholders
   
   ## Installation
   
   **Windows**: Download `AntTorrent-Setup-1.1.0.exe` and run
   
   ## Changes
   See full changelog: [CHANGELOG.md](CHANGELOG.md)
   ```
4. Upload files:
   - `release/AntTorrent Setup 1.0.0.exe` (rename to include version)
5. Click "Publish release"

### Method 2: Using GitHub CLI (gh)

```bash
# Make sure you're on the right branch
git checkout feature/selective-file-download

# Create release with uploaded file
gh release create v1.1.0 \
  "release/AntTorrent Setup 1.0.0.exe#AntTorrent-Setup-1.1.0.exe" \
  --title "AntTorrent v1.1.0 - Selective File Download" \
  --notes-file RELEASE_NOTES.md
```

### Method 3: Automated with GitHub Actions

Create `.github/workflows/release.yml`:
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run package
      - uses: softprops/action-gh-release@v1
        with:
          files: release/*.exe
```

Then create a release:
```bash
git tag v1.1.0
git push origin v1.1.0
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **Major** (1.x.x): Breaking changes
- **Minor** (x.1.x): New features (like selective download)
- **Patch** (x.x.1): Bug fixes

Current version: `1.0.0` → Next version: `1.1.0`

Update version in:
```bash
# In package.json
"version": "1.1.0"

# Rebuild and package
npm run package
```

## Testing Before Release

### 1. Manual Testing Checklist
- [ ] Install from `.exe` on clean Windows machine
- [ ] Add torrent with magnet link
- [ ] Test selective file download
- [ ] Verify 0KB files created for deselected files
- [ ] Test pause/resume
- [ ] Test app restart (state persistence)
- [ ] Check file associations (.torrent, magnet:)
- [ ] Test settings changes
- [ ] Verify tray icon works

### 2. Test Commands
```bash
# Run in dev mode
npm run dev

# Build and test locally
npm run build
npm run start
```

## Troubleshooting Build Issues

### Problem: npm install fails
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problem: Build fails with TypeScript errors
```bash
# Check TypeScript version
npm list typescript

# Rebuild
rm -rf dist dist-electron
npm run build
```

### Problem: electron-builder fails
```bash
# Install globally
npm install -g electron-builder

# Try again
npm run package
```

### Problem: Missing icon
```bash
# Ensure icon exists
ls resources/icon.ico

# If missing, create from PNG
# Use online converter or imagemagick
```

## Distribution Checklist

Before releasing:
- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Test installer on clean machine
- [ ] Update screenshots
- [ ] Write release notes
- [ ] Tag commit: `git tag v1.1.0`
- [ ] Push tag: `git push origin v1.1.0`
- [ ] Create GitHub release
- [ ] Upload installer
- [ ] Announce on social media / Discord / etc.

## File Sizes (Approximate)

- Source code: ~5 MB
- node_modules: ~400 MB
- Built app: ~150 MB
- Installer: ~150-200 MB (compressed)

## Platform-Specific Notes

### Windows
- Requires Windows 10 or later
- Auto-updater works with NSIS installer
- Code signing recommended for production (prevents warnings)

### macOS (Future)
```bash
npm run package -- --mac
```

### Linux (Future)
```bash
npm run package -- --linux
```

## Post-Release

After releasing:
1. Monitor GitHub issues for bug reports
2. Check download counts
3. Collect user feedback
4. Plan next release
5. Update documentation

## Quick Reference

```bash
# Full release process
git checkout feature/selective-file-download
npm install
npm run build
npm run package
gh release create v1.1.0 "release/AntTorrent Setup 1.0.0.exe"
```

## Support

For help:
- GitHub Issues: https://github.com/Arionyxx/Anttorrent/issues
- Documentation: See README.md and other .md files
