# Troubleshooting Guide

## Common Build/Runtime Errors

### 1. ESM Module Error
```
Error [ERR_REQUIRE_ASYNC_MODULE]: require() cannot be used on an ESM graph with top-level await
```

**Solution:** ✅ Fixed in latest commit
- WebTorrent v2.x uses ESM modules
- Now using dynamic `import()` instead of `require()`
- Make sure you're on the latest commit

**Pull the fix:**
```bash
git pull origin feature/selective-file-download
npm run build
npm run dev
```

---

### 2. npm install fails
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**
```bash
# Option 1: Force install
npm install --force

# Option 2: Clean install
rm -rf node_modules package-lock.json
npm install

# Option 3: Use legacy peer deps
npm install --legacy-peer-deps
```

---

### 3. Build fails with TypeScript errors
```
error TS2307: Cannot find module 'webtorrent'
```

**Solutions:**
```bash
# Install types
npm install --save-dev @types/webtorrent

# Clear build cache
rm -rf dist dist-electron
npm run build

# If still failing, check tsconfig.json
```

---

### 4. electron-builder fails
```
Error: Application entry file "dist-electron/main/main.js" does not exist
```

**Solutions:**
```bash
# Make sure to build first
npm run build

# Then package
npm run package

# Or use the combined command
npm run build && npm run package
```

---

### 5. App crashes on startup
```
App threw an error during load
```

**Check:**
1. Build succeeded: `npm run build`
2. Check console for specific error
3. Try dev mode: `npm run dev`
4. Clear electron cache:
   ```bash
   # Windows
   rd /s /q %APPDATA%\anttorrent
   
   # Linux/Mac
   rm -rf ~/.config/anttorrent
   ```

---

### 6. File selection not working
```
Failed to get torrent files: timeout
```

**Possible causes:**
- Magnet link is invalid
- No peers available for metadata
- Network/firewall blocking DHT

**Solutions:**
- Wait longer (metadata can take 30+ seconds)
- Try a different torrent with more seeders
- Check firewall settings
- Use a .torrent file instead of magnet link

---

### 7. Git merge conflicts
```
fatal: Exiting because of an unresolved conflict
```

**Solutions:**
```bash
# Abort and retry
git merge --abort
git pull origin feature/selective-file-download

# Or reset to remote (⚠️ loses local changes)
git fetch origin
git reset --hard origin/feature/selective-file-download
```

---

### 8. Windows installer won't run
```
Windows protected your PC
```

**Solutions:**
- Click "More info" → "Run anyway"
- This happens because app is not code-signed
- For production, consider code signing certificate

---

### 9. Port already in use (dev mode)
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solutions:**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>
```

---

### 10. Torrent won't download
```
Torrent added but not downloading
```

**Check:**
1. Is it paused? Click resume
2. Check firewall/antivirus
3. Check if tracker is up
4. Try adding DHT trackers:
   ```
   &tr=udp://tracker.opentrackr.org:1337/announce
   ```

---

## Development Issues

### Hot reload not working
```bash
# Restart dev server
npm run dev
```

### TypeScript types not updating
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Linter errors
```bash
# Fix auto-fixable issues
npm run lint --fix
```

---

## Platform-Specific Issues

### Windows

**NSIS installer fails:**
```bash
# Install Windows Build Tools
npm install --global --production windows-build-tools

# Or use Visual Studio Installer
# Install "Desktop development with C++"
```

**Path too long error:**
```bash
# Enable long paths
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1 /f
```

### Linux

**Missing dependencies:**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# Fedora
sudo dnf install @development-tools
```

### macOS

**Xcode required:**
```bash
xcode-select --install
```

---

## Performance Issues

### High CPU usage
- Check number of active torrents
- Reduce `maxConns` in settings
- Pause unused torrents

### High memory usage
- WebTorrent loads pieces in memory
- Close app and restart
- Limit simultaneous downloads

### Slow UI
- Reduce update frequency (edit updateInterval in torrentManager)
- Disable details panel in settings
- Reduce number of torrents in list

---

## Data Issues

### Lost torrents after update
**Check:**
```bash
# electron-store location
# Windows: %APPDATA%\anttorrent
# Linux: ~/.config/anttorrent
# macOS: ~/Library/Application Support/anttorrent
```

**Restore:**
- Check `config.json` in store directory
- Torrents are saved under `"torrents"` key

### Settings reset
- Check store directory (above)
- Settings under `"settings"` key
- Backup `config.json` regularly

---

## Network Issues

### No peers found
1. Check DHT is enabled in settings
2. Add manual trackers to magnet link
3. Try popular torrents first to test
4. Check router UPnP settings

### Slow download speeds
1. Check bandwidth limits in settings
2. Increase max connections
3. Enable UPnP/NAT-PMP
4. Forward ports manually:
   - Default DHT port: 6881
   - Configure in router

---

## Debugging

### Enable detailed logging

**In torrentManager.ts:**
```typescript
console.log('Debug:', { /* your data */ })
```

**In renderer:**
```typescript
// Open DevTools
Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (macOS)
```

**Check Electron logs:**
```bash
# Run from terminal to see console output
npm run dev
```

---

## Getting Help

If you're still stuck:

1. **Check GitHub Issues**: https://github.com/Arionyxx/Anttorrent/issues
2. **Search existing issues** for similar problems
3. **Create new issue** with:
   - Error message
   - Steps to reproduce
   - OS and version
   - Node/npm version
   - Screenshots if relevant

**Include version info:**
```bash
node --version
npm --version
npx electron --version
```

---

## Quick Fixes Checklist

When something goes wrong:

- [ ] `git pull` latest changes
- [ ] `rm -rf node_modules && npm install`
- [ ] `rm -rf dist dist-electron`
- [ ] `npm run build`
- [ ] Restart app/dev server
- [ ] Check console for errors
- [ ] Clear electron-store data
- [ ] Try in dev mode: `npm run dev`
- [ ] Check GitHub issues

---

## Useful Commands

```bash
# Start fresh
rm -rf node_modules package-lock.json dist dist-electron
npm install
npm run build
npm run dev

# Check versions
node --version
npm --version

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Audit security issues
npm audit
npm audit fix
```
