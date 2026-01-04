
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    transparent: true,
    frame: false, // Borderless for that "Buddy" feel
    alwaysOnTop: true, // Keep buddy on top of other apps
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // In a real build, this would load the compiled index.html
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
