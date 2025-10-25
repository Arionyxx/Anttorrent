# Selective File Download Feature

## Overview
This feature allows users to select which files they want to download from a torrent. Unselected files will be created as 0KB placeholder files (empty files with the correct path structure).

## How It Works

### User Flow
1. User enters a magnet link or URL in the "Add Torrent" modal
2. User clicks "Select Files" button (optional step)
3. Application fetches torrent metadata to get list of files
4. User sees a table with all files, their sizes, and checkboxes
5. User can check/uncheck individual files or use "Select All"/"Deselect All"
6. User confirms and adds the torrent
7. Only selected files are downloaded, unselected files appear as 0KB placeholders

### Technical Implementation

#### Frontend Components

**AddTorrentModal.tsx Changes:**
- Added file selection state management
- New UI for displaying file list in a table
- Checkbox for each file with file name and size
- "Select Files" button to trigger metadata fetch
- Two-step process: settings → file selection (optional)
- "Back to Settings" button to return to main view

**App.tsx Changes:**
- Updated `handleAddTorrent()` to accept `selectedFiles` parameter
- Pass selected file indices to the backend

**Preload.ts Changes:**
- Added `getTorrentFiles()` API endpoint
- Updated `addTorrent()` signature to accept `selectedFiles` option

#### Backend Implementation

**torrentManager.ts Changes:**

1. **getTorrentFiles() Method:**
   - Creates temporary WebTorrent client
   - Adds torrent just to get metadata
   - Extracts file list (name, size, path)
   - Destroys temporary client
   - Returns file information to frontend
   - 30-second timeout for metadata fetch

2. **addTorrent() Updates:**
   - Accepts `selectedFiles` parameter (array of file indices)
   - After torrent is added, loops through files
   - Calls `file.deselect()` for unselected files
   - Saves file selection state to electron-store
   - Persists selections for session restoration

3. **loadSavedTorrents() Updates:**
   - Restores file selections when reloading torrents
   - Applies saved file selections on torrent re-add

**main.ts Changes:**
- Added `get-torrent-files` IPC handler
- Updated `add-torrent` handler to accept `selectedFiles` option

## WebTorrent File Selection

The implementation uses WebTorrent's built-in file selection API:

```javascript
torrent.files.forEach((file, index) => {
  if (!selectedSet.has(index)) {
    file.deselect()  // Skip downloading this file
  }
})
```

### What `file.deselect()` Does:
- Tells WebTorrent to skip downloading pieces for this file
- Creates a 0KB file on disk (placeholder)
- Maintains correct directory structure
- File appears in file list but has 0 bytes
- Can be re-selected later to start downloading

## Data Persistence

File selections are stored in electron-store:

```javascript
{
  magnetURI: string,
  path: string,
  dateAdded: number,
  selectedFiles: number[]  // Array of selected file indices
}
```

On app restart, saved selections are restored automatically.

## User Interface

### File Selection Table
```
┌──────────────────────────────────────────────────┐
│ Select Files to Download                        │
│ [Deselect All]                                   │
├────┬──────────────────────────┬──────────────────┤
│ ☑  │ video.mp4                │ 1.5 GB          │
│ ☑  │ subtitles.srt            │ 45 KB           │
│ ☐  │ sample.mp4               │ 25 MB           │
│ ☑  │ readme.txt               │ 2 KB            │
└────┴──────────────────────────┴──────────────────┘
3 of 4 files selected
```

## Benefits

1. **Save Bandwidth**: Skip downloading unwanted files
2. **Save Disk Space**: Only download needed files
3. **Faster Downloads**: Fewer pieces to download
4. **Clean Organization**: Placeholder files maintain structure
5. **Flexible**: Can change selection later if needed

## Limitations

1. **Metadata Required**: Must fetch torrent metadata first (can take a few seconds)
2. **All or Nothing**: File selection is at torrent-add time
3. **0KB Files**: Deselected files appear as empty files on disk
4. **No Partial Files**: Can't download just part of a file

## Example Use Cases

1. **TV Show Pack**: Download only certain episodes
2. **Album**: Skip bonus tracks or artwork
3. **Game Bundle**: Download only specific games
4. **Course Materials**: Select only needed lessons
5. **Multi-language**: Choose only your language files

## Future Enhancements

Potential improvements:
- Dynamic file selection after torrent is added
- File priority settings (high/normal/low)
- File type filters (e.g., "only video files")
- Preview mode for common file types
- Re-enable downloading of deselected files
- Delete deselected placeholder files option
