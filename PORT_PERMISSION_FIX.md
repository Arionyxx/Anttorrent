# Port Permission Error Fix

## Issue
```
WebTorrent error: Error: permission denied
code: 'EACCES'
```

## Cause
WebTorrent tries to bind to network ports for P2P connections. This can fail due to:

1. **Firewall blocking** - Windows Firewall blocking the app
2. **Port conflicts** - Another app using the same port
3. **Permission issues** - Need admin rights or firewall exception
4. **Antivirus blocking** - Security software blocking network access

## Solutions Applied

### 1. Random Port Assignment
- Changed from fixed ports to random available ports
- Uses port 0 which means "any available port"
- Reduces chance of conflicts

### 2. Disabled UTP for Metadata
- UTP (micro Transport Protocol) disabled for temporary clients
- Reduces permission requirements
- Still works for downloading torrents

### 3. Graceful Error Handling
- Errors are logged but don't crash the app
- Users can still add torrents without file selection
- Fallback to DHT-disabled mode if needed

## Manual Fixes

### Windows Firewall Exception

**Option 1: When prompted**
1. Run the app
2. Windows Firewall will ask for permission
3. Click "Allow access"
4. Check both "Private" and "Public" networks

**Option 2: Add manually**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Click "Change settings"
4. Click "Allow another app"
5. Browse to: `C:\Users\...\Anttorrent\node_modules\electron\dist\electron.exe`
6. Add it and check both network types

**Option 3: Command line** (Run as Administrator)
```cmd
netsh advfirewall firewall add rule name="AntTorrent" dir=in action=allow program="C:\path\to\electron.exe" enable=yes
```

### Disable Antivirus Temporarily
Some antivirus software blocks P2P connections:
- Windows Defender: Add exception
- Third-party AV: Add to whitelist/exceptions

### Run as Administrator
Right-click app and select "Run as administrator"

### Check Port Conflicts
Find what's using ports:
```cmd
netstat -ano | findstr :6881
```

Kill conflicting process:
```cmd
taskkill /PID <process_id> /F
```

## Testing If It Works

### 1. Check if app starts
```
✓ App should launch without crashing
✓ No repeated "permission denied" errors
✓ Can add torrents normally
```

### 2. Test file selection (optional feature)
```
- Click "Select Files" button
- If it works: File list loads
- If it fails: Error message shown, but you can still add torrent
```

### 3. Download test
```
- Add a torrent (with or without file selection)
- Should start downloading
- Check status shows "downloading"
```

## What Still Works Without Ports

Even if port binding fails:
- ✓ Can add torrents
- ✓ Can download files
- ✓ Basic functionality works
- ✗ DHT may not work (fewer peers)
- ✗ File selection might timeout
- ✗ Upload may be limited

## Configuration Options

You can adjust settings if needed:

### Low Permissions Mode
Edit `torrentManager.ts`:
```typescript
this.client = new WebTorrent({
  maxConns: 10,      // Reduce connections
  dht: false,        // Disable DHT
  utp: false,        // Disable UTP
  webSeeds: true     // Keep web seeds
})
```

### High Performance Mode
```typescript
this.client = new WebTorrent({
  maxConns: 100,
  dht: {
    port: 6881       // Standard BitTorrent port
  },
  utp: true,
  tracker: {
    announce: [
      'udp://tracker.opentrackr.org:1337',
      'udp://open.stealth.si:80'
    ]
  }
})
```

## Network Requirements

### Minimum (works without ports)
- Internet connection
- Web seed access
- HTTP/HTTPS allowed

### Recommended (best performance)
- Allow TCP/UDP on random ports
- Firewall exception for app
- UPnP enabled on router

### Optimal (maximum speed)
- Port forwarding: 6881-6889
- DHT enabled
- Multiple trackers
- UTP and TCP enabled

## Troubleshooting Checklist

- [ ] Windows Firewall has exception for app
- [ ] Antivirus not blocking
- [ ] Not running multiple instances
- [ ] Using latest version
- [ ] No VPN blocking ports
- [ ] Router allows P2P traffic
- [ ] Not behind strict corporate firewall

## Alternative: Use Without File Selection

If file selection doesn't work:
1. Add torrent normally (don't click "Select Files")
2. All files will download
3. Manually delete unwanted files after
4. Or pause torrent and delete files, then resume

## Still Having Issues?

### 1. Check Error Details
Look in developer console:
```
Ctrl+Shift+I → Console tab
Look for specific error codes
```

### 2. Try Different Torrent
Some torrents with no peers won't work:
- Use popular torrents
- Try Ubuntu ISO or other legal content
- Check if torrent has seeders

### 3. Network Test
```cmd
# Test if port is open
telnet localhost 6881

# Check firewall status
netsh advfirewall show currentprofile
```

### 4. Clean Reinstall
```bash
# Remove old files
rm -rf node_modules
rm -rf %APPDATA%/anttorrent

# Fresh install
npm install
npm run dev
```

## Production Build Notes

When building the installer:
- Request firewall access during installation
- Add to Windows Defender exclusions
- Sign the executable (removes warnings)
- Include network requirements in docs

## Code Changes Made

### torrentManager.ts
```typescript
// Random ports
torrentPort: 0

// DHT with random port
dht: { port: 0 }

// Disable UTP for temp clients
utp: false
```

### Error Handling
```typescript
client.on('error', (err) => {
  if (err.code === 'EACCES') {
    console.warn('Permission denied')
    // Continue anyway
  }
})
```

## Summary

The permission error is **non-fatal**:
- App still works
- Downloads still function
- File selection is optional
- Can add torrents normally

Main fix: Use random ports and disable UTP for metadata fetching.
