# AntTorrent - Quick Start Guide

Get AntTorrent up and running in 5 minutes!

## Installation

### For Developers

```bash
# 1. Install Node.js 20+ from https://nodejs.org/

# 2. Clone or download this repository
git clone <repository-url>
cd anttorrent

# 3. Install dependencies
npm install

# 4. Run in development mode
npm run dev
```

The app will launch with hot-reload enabled. Any changes you make to the code will automatically refresh the app.

### For End Users

```bash
# 1. Build the Windows installer
npm run build
npm run package

# 2. Find the installer in the release/ folder
# 3. Run AntTorrent Setup 1.0.0.exe
# 4. Follow the installation wizard
```

## First Run

When you first launch AntTorrent:

1. **Custom Title Bar**: Notice the ant emoji 🐜 and custom window controls at the top
2. **System Tray**: Look for the AntTorrent icon in your system tray (bottom-right)
3. **Dark Theme**: The app uses a dark theme by default (changeable in settings)
4. **Empty State**: You'll see a welcome message since you haven't added any torrents yet

## Adding Your First Torrent

### Method 1: Magnet Link

1. Click the **"Add Torrent"** button (or press `Ctrl+O`)
2. Select the **"Magnet / URL"** tab
3. Paste a magnet link (example below)
4. Choose where to save files
5. Click **"Add Torrent"**

**Test Magnet Link** (Ubuntu ISO):
```
magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Ubuntu+20.04+LTS
```

### Method 2: Torrent File

1. Click **"Add Torrent"**
2. Select the **"File"** tab
3. Click **"Browse for Torrent Files..."**
4. Select one or more .torrent files
5. They'll be added immediately

### Method 3: Drag & Drop (Coming Soon)

Simply drag a .torrent file or magnet link onto the AntTorrent window.

## Basic Operations

### Pause a Torrent
- Click the **pause button** (⏸️) next to the torrent
- Or select the torrent and press **Space**

### Resume a Torrent
- Click the **play button** (▶️) next to the torrent
- Or select the torrent and press **Space** again

### Remove a Torrent
- Click the **trash button** (🗑️) next to the torrent
- Or select the torrent and press **Delete**
- Choose whether to delete files from disk

### View Torrent Details
- Click on any torrent in the list
- The details panel will appear at the bottom
- Switch between **Overview**, **Files**, and **Peers** tabs

## Using the Sidebar

Filter torrents by status:

- **All Torrents**: Shows everything
- **Downloading**: Currently downloading torrents
- **Completed**: Finished downloads
- **Seeding**: Uploading to other peers
- **Paused**: Paused torrents

The badge next to each filter shows how many torrents match.

## Settings

Press `Ctrl+,` or click the **⚙️ Settings** button to configure:

### General Tab
- Change default download location
- Enable "Start with Windows"
- Configure system tray behavior
- Toggle notifications

### Connection Tab
- Set download/upload speed limits (0 = unlimited)
- Configure max connections per torrent
- Enable/disable DHT, PEX, UPnP

### Torrents Tab
- Auto-start torrents when added
- Auto-open folder when complete
- Set seeding ratio limit
- Max simultaneous downloads

### Appearance Tab
- Change theme (Night, Dark, Light)
- View mode (Compact, Comfortable, Spacious)
- Show/hide details panel

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open torrent file |
| `Ctrl+V` | Add from clipboard (paste magnet link) |
| `Ctrl+,` | Open settings |
| `Space` | Pause/Resume selected torrent |
| `Delete` | Remove selected torrent |
| `Ctrl+F` | Focus search box |
| `F5` | Refresh |
| `Ctrl+Alt+T` | Show/hide window (global hotkey) |
| `Alt+F4` | Quit app |

## System Tray

AntTorrent runs in the system tray:

### Minimize to Tray
- Click the minimize button (or press the X if "Close to tray" is enabled)
- The app will continue running in the background
- Torrents will keep downloading/uploading

### Show from Tray
- Double-click the tray icon
- Or right-click and select "Show AntTorrent"

### Tray Menu
Right-click the tray icon to see:
- Download/upload speeds
- Quick actions (Pause All, Resume All)
- Exit option

## Monitoring Downloads

### In the Torrent List
Each torrent shows:
- Name
- Size
- Progress bar with percentage
- Download speed (blue ↓)
- Upload speed (green ↑)
- Number of peers
- Status badge

### In the Status Bar
Bottom of the window shows:
- Total download speed
- Total upload speed
- Number of active torrents

### In the Details Panel
Select a torrent to see:
- Complete metadata
- File list with individual progress
- Connected peers
- Info hash

## Tips & Tricks

### 1. Finding Torrents
Always use legal torrent sources:
- Ubuntu: https://ubuntu.com/download/alternative-downloads
- Debian: https://www.debian.org/CD/torrent-cd/
- Internet Archive: https://archive.org/

### 2. Faster Downloads
- Enable DHT, PEX, and UPnP in Connection settings
- Ensure your firewall allows WebTorrent connections
- Choose torrents with many seeders

### 3. Being a Good Peer
- Let torrents seed after downloading (ratio > 1.0)
- Don't set upload speed too low
- Keep the app running after downloads complete

### 4. Managing Space
- Monitor your download location
- Remove completed torrents you don't need
- Set a seeding ratio limit to auto-stop

### 5. Privacy
- WebTorrent uses WebRTC, which may expose your IP
- Use a VPN if privacy is a concern
- Be aware of what you're downloading/sharing

## Troubleshooting

### App Won't Start
```bash
# Clear build and reinstall
rm -rf node_modules dist dist-electron
npm install
npm run build
npm start
```

### No Peers Connecting
- Check your firewall isn't blocking WebTorrent
- Ensure DHT/PEX are enabled in settings
- Try a different torrent with more seeders
- WebRTC may require UPnP/port forwarding

### Slow Downloads
- Check your internet speed
- Verify speed limits aren't set in settings
- Choose torrents with more seeders
- Reduce number of simultaneous downloads

### Settings Not Saving
- Check the config file exists: `%APPDATA%/anttorrent/config.json`
- Ensure the app has write permissions
- Try running as administrator (not recommended long-term)

### Torrents Disappear on Restart
- Currently, torrent list is not persisted between sessions
- This is a known limitation (see TODO.md)
- Re-add your torrents after restart

## What's Next?

1. **Add some torrents** and watch them download
2. **Explore the settings** and customize to your liking
3. **Check out the details panel** to see what's happening
4. **Monitor the system tray** when the app is minimized
5. **Report bugs** or suggest features on GitHub

## Getting Help

- Read the [README.md](README.md) for full documentation
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for development info
- See [TODO.md](TODO.md) for planned features
- Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) to understand the codebase

## Legal Notice

AntTorrent is a BitTorrent client. It can be used to download both legal and illegal content. The developers of AntTorrent:

- Do not endorse piracy or copyright infringement
- Are not responsible for how you use this software
- Encourage you to only download legal content
- Recommend supporting content creators

Always ensure you have the right to download and share any files.

---

**Enjoy AntTorrent! 🐜**
