import { app, protocol } from 'electron'

export function setupProtocolHandler(): void {
  // Register magnet protocol
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('magnet', process.execPath, [process.argv[1]])
    }
  } else {
    app.setAsDefaultProtocolClient('magnet')
  }

  // Handle magnet links on Windows
  app.on('open-url', (event, url) => {
    event.preventDefault()
    // The URL will be handled by the renderer process
  })
}
