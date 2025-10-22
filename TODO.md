# AntTorrent - TODO / Production Checklist

## Before Production Deployment

### Icons
- [ ] Create proper app icon (256x256 PNG) at `resources/icon.png`
- [ ] Create Windows icon (.ico format with multiple sizes: 16x16, 32x32, 48x48, 256x256) at `resources/icon.ico`
- [ ] Recommended tool: https://www.img2go.com/convert-to-ico or GIMP

### Torrent Features to Implement
- [ ] Implement context menu (right-click on torrents)
- [ ] Add clipboard monitoring for magnet links
- [ ] Implement drag-and-drop for torrent files
- [ ] Add sequential download toggle
- [ ] Implement bandwidth scheduler
- [ ] Add global hotkey registration
- [ ] Persist torrent list between sessions
- [ ] Add torrent queue management

### Testing
- [ ] Test with real .torrent files
- [ ] Test magnet link handling
- [ ] Test system tray on minimize/close
- [ ] Test start with Windows
- [ ] Test file associations (.torrent files)
- [ ] Test notifications
- [ ] Test with multiple torrents
- [ ] Test pause/resume functionality
- [ ] Test remove with/without files

### Security
- [ ] Review IPC security
- [ ] Ensure no XSS vulnerabilities
- [ ] Validate all user inputs
- [ ] Test with malformed torrent files

### Performance
- [ ] Optimize torrent list rendering for 100+ torrents
- [ ] Implement virtual scrolling for large lists
- [ ] Optimize update intervals
- [ ] Test memory usage over extended periods

### Windows Integration
- [ ] Test installer on clean Windows machine
- [ ] Verify file associations work correctly
- [ ] Test magnet link protocol handler
- [ ] Verify uninstaller removes all traces
- [ ] Test on Windows 10 and Windows 11

### Documentation
- [ ] Add screenshots to README
- [ ] Create user guide
- [ ] Document keyboard shortcuts
- [ ] Add troubleshooting section

## Known Limitations

- WebTorrent uses WebRTC which may have firewall issues on some networks
- File selection for individual files in a torrent is not yet implemented
- Peer information display is placeholder only
- No speed graphs yet
- No RSS feed support
- No sequential download option yet
