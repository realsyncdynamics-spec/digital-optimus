// Digital Optimus - Electron Main Process
// RealSync Dynamics 2026

const { app, BrowserWindow, ipcMain, desktopCapturer, Tray, Menu } = require('electron');
const path = require('path');
const { ScreenCapture } = require('./src/capture');
const { Agent } = require('./src/agent');
const { API } = require('./src/api');

let mainWindow;
let tray;
let agent;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('ui/index.html');
  mainWindow.setAlwaysOnTop(true, 'floating');
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Digital Optimus', enabled: false },
    { type: 'separator' },
    { label: 'Dashboard oeffnen', click: () => mainWindow.show() },
    { label: 'Agent starten', click: () => agent.start() },
    { label: 'Agent stoppen', click: () => agent.stop() },
    { type: 'separator' },
    { label: 'Beenden', click: () => app.quit() }
  ]);
  tray.setToolTip('Digital Optimus - Screen Agent');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Init modules
  const capture = new ScreenCapture();
  const api = new API();
  agent = new Agent(capture, api);

  // IPC Handlers
  ipcMain.handle('agent:start', async (_, goal) => {
    return await agent.executeTask(goal);
  });

  ipcMain.handle('agent:stop', () => {
    agent.stop();
    return { status: 'stopped' };
  });

  ipcMain.handle('agent:status', () => {
    return agent.getStatus();
  });

  ipcMain.handle('capture:screenshot', async () => {
    return await capture.takeScreenshot();
  });

  ipcMain.handle('api:seal', async (_, contentHash) => {
    return await api.createSealProof(contentHash);
  });

  ipcMain.handle('api:tasks', async () => {
    return await api.getTasks();
  });

  console.log('Digital Optimus ready.');
});

app.on('window-all-closed', () => {
  // Keep running in tray
});
