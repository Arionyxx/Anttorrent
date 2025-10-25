# Selective File Download Architecture

## System Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant UI as AddTorrentModal
    participant App as App.tsx
    participant Pre as Preload
    participant Main as Main Process
    participant TM as TorrentManager
    participant WT as WebTorrent
    participant Store as Electron-Store

    U->>UI: Enter magnet link
    U->>UI: Click "Select Files"
    UI->>Pre: getTorrentFiles(magnet)
    Pre->>Main: IPC: get-torrent-files
    Main->>TM: getTorrentFiles(magnet)
    
    Note over TM,WT: Create temporary client
    TM->>WT: new WebTorrent()
    TM->>WT: add(magnet, {path: '/tmp'})
    WT-->>TM: torrent with metadata
    TM->>TM: Extract files info
    TM->>WT: destroy()
    
    TM-->>Main: [{name, length, path}]
    Main-->>Pre: File list
    Pre-->>UI: File list
    
    UI->>UI: Display files in table
    U->>UI: Select/deselect files
    U->>UI: Click "Add Torrent"
    
    UI->>App: onAddTorrent(magnet, selectedFiles)
    App->>Pre: addTorrent(magnet, {path, selectedFiles})
    Pre->>Main: IPC: add-torrent
    Main->>TM: addTorrent(magnet, options)
    
    TM->>WT: add(magnet, {path})
    WT-->>TM: torrent
    
    alt selectedFiles provided
        TM->>TM: Loop through files
        TM->>WT: file.deselect() for unselected
        Note over WT: Creates 0KB placeholders
        TM->>Store: Save selectedFiles state
    end
    
    TM-->>Main: infoHash
    Main-->>Pre: {success: true, infoHash}
    Pre-->>App: Result
    App->>UI: Close modal
```

## Component Architecture

```mermaid
graph TB
    subgraph "Renderer Process"
        A[AddTorrentModal.tsx]
        B[App.tsx]
        C[TorrentTable.tsx]
        D[DetailsPanel.tsx]
        
        A -->|onAddTorrent| B
        B -->|torrents state| C
        B -->|selected torrent| D
    end
    
    subgraph "Preload Bridge"
        E[preload.ts]
        
        A -->|getTorrentFiles| E
        A -->|addTorrent| E
        B -->|IPC calls| E
    end
    
    subgraph "Main Process"
        F[main.ts]
        G[TorrentManager]
        H[electron-store]
        
        E -.IPC.-> F
        F --> G
        G --> H
    end
    
    subgraph "WebTorrent"
        I[WebTorrent Client]
        J[Torrent Instance]
        K[File Objects]
        
        G --> I
        I --> J
        J --> K
    end
    
    style A fill:#4CAF50
    style G fill:#2196F3
    style I fill:#FF9800
```

## Data Flow for File Selection

```mermaid
graph LR
    A[User Input] --> B{Select Files?}
    B -->|Yes| C[Fetch Metadata]
    B -->|No| D[Add All Files]
    
    C --> E[Show File List]
    E --> F[User Selects Files]
    F --> G[Pass to Backend]
    
    G --> H{Has Selected Files?}
    H -->|Yes| I[Call file.deselect]
    H -->|No| J[Download All]
    
    I --> K[Create 0KB Files]
    J --> L[Download All Files]
    
    K --> M[Save State]
    L --> M
    M --> N[Start Download]
    
    style A fill:#E1F5FE
    style I fill:#FFF9C4
    style K fill:#FFCCBC
```

## File Selection State Management

```mermaid
stateDiagram-v2
    [*] --> Initial: Open Modal
    Initial --> EnterMagnet: User enters magnet
    EnterMagnet --> LoadingFiles: Click "Select Files"
    
    LoadingFiles --> FileSelection: Files loaded
    LoadingFiles --> Error: Timeout/Error
    
    FileSelection --> FileSelection: Toggle checkboxes
    FileSelection --> EnterMagnet: Back to settings
    FileSelection --> AddingTorrent: Submit
    
    EnterMagnet --> AddingTorrent: Submit without selection
    
    AddingTorrent --> [*]: Success
    
    Error --> EnterMagnet: Retry
```

## Storage Structure

```mermaid
erDiagram
    ELECTRON_STORE ||--o{ TORRENT : contains
    TORRENT {
        string infoHash PK
        string magnetURI
        string path
        number dateAdded
        boolean paused
        array selectedFiles "Optional: file indices"
    }
    
    TORRENT ||--o{ FILE_SELECTION : has
    FILE_SELECTION {
        number index
        boolean selected
    }
```

## Key Interactions

### 1. Metadata Fetch
```
User → UI → Preload → Main → TorrentManager
TorrentManager: Creates temp WebTorrent → Gets metadata → Returns files
```

### 2. File Deselection
```
User selects files → Sends indices array → TorrentManager
For each file not in array: call file.deselect()
Result: 0KB placeholder files on disk
```

### 3. State Persistence
```
File selections → Saved to electron-store
On app restart → Torrent restored → File selections re-applied
```

## File System Result

When files are deselected:
```
download_folder/
├── selected_file_1.mp4      [1.5 GB] ✓ Downloaded
├── selected_file_2.txt      [2 KB]   ✓ Downloaded
├── deselected_file.mp4      [0 KB]   ✗ Placeholder
└── subfolder/
    ├── selected_file_3.srt  [45 KB]  ✓ Downloaded
    └── deselected_file.doc  [0 KB]   ✗ Placeholder
```

## Performance Considerations

1. **Metadata Fetch**: 5-30 seconds depending on peers
2. **File Deselection**: Instant (happens during torrent add)
3. **Memory**: Temporary client for metadata (~50MB)
4. **Disk**: 0KB files created instantly
5. **Network**: Only selected file pieces downloaded

## Security & Error Handling

- Timeout for metadata fetch (30s)
- Temporary client destroyed after use
- Invalid selections ignored gracefully
- State restored safely on errors
- No network activity for deselected files
