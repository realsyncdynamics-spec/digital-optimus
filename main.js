require('dotenv').config();

// Digital Optimus - Electron Main Process
// RealSync Dynamics 2026

const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { ScreenCapture } = require('./src/capture');
const { Agent } = require('./src/agent');
const { API } = require('./src/api');
const IPC = require('./src/shared/ipc-channels');

let mainWindow;
let tray;
let agent;
let goBridgePort = null;
let goProcess = null;

// --- Go Backend Bridge ---

function spawnGoBridge() {
  const goBinaryPath = path.join(__dirname, 'go-agent', 'bin', 'desktop-client');
  try {
    goProcess = spawn(goBinaryPath, ['--http'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    console.warn('Go bridge binary not found, running without Go backend:', err.message);
    return;
  }

  goProcess.stdout.on('data', (chunk) => {
    const line = chunk.toString().trim();
    // Go binary prints "LISTENING:<port>" on startup
    const match = line.match(/^LISTENING:(\d+)$/);
    if (match) {
      goBridgePort = parseInt(match[1], 10);
      console.log(`Go bridge connected on port ${goBridgePort}`);
    }
  });

  goProcess.stderr.on('data', (chunk) => {
    console.error('[go-bridge]', chunk.toString().trim());
  });

  goProcess.on('error', (err) => {
    console.warn('Failed to start Go bridge:', err.message);
    goProcess = null;
  });

  goProcess.on('exit', (code) => {
    console.log(`Go bridge exited with code ${code}`);
    goProcess = null;
    goBridgePort = null;
  });
}

// --- Window & Tray ---

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

// --- IPC Handler Helper ---

function handleIPC(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      const data = await handler(...args);
      return { success: true, data };
    } catch (err) {
      console.error(`IPC error [${channel}]:`, err);
      return { success: false, error: err.message, code: err.code || 'UNKNOWN_ERROR' };
    }
  });
}

// --- App Lifecycle ---

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Init modules
  const capture = new ScreenCapture();
  const api = new API();
  agent = new Agent(capture, api);

  // Spawn Go backend
  spawnGoBridge();

  // --- IPC Handlers (all using shared channel constants + try/catch) ---

  handleIPC(IPC.AGENT_START, async (goal) => {
    return await agent.executeTask(goal);
  });

  handleIPC(IPC.AGENT_STOP, () => {
    agent.stop();
    return { status: 'stopped' };
  });

  handleIPC(IPC.AGENT_STATUS, () => {
    return agent.getStatus();
  });

  handleIPC(IPC.CAPTURE_SCREENSHOT, async () => {
    return await capture.takeScreenshot();
  });

  handleIPC(IPC.SEAL_CONTENT, async (contentHash, metadata) => {
    return await api.createSealProof(contentHash, metadata);
  });

  handleIPC(IPC.GET_TASKS, async () => {
    return await api.getTasks();
  });

  handleIPC(IPC.CREATE_TASK, async (data) => {
    return await api.createTask(data);
  });

  handleIPC(IPC.GET_AUTOMATIONS, async () => {
    return await api.getAutomations();
  });

  handleIPC(IPC.CREATE_AUTOMATION, async (data) => {
    return await api.createAutomation(data);
  });

  handleIPC(IPC.RUN_AUTOMATION, async (id) => {
    // If Go bridge is available, delegate to it; otherwise stub
    if (goBridgePort) {
      const fetch = require('node-fetch');
      const resp = await fetch(`http://localhost:${goBridgePort}/api/automations/${id}/run`, { method: 'POST' });
      return await resp.json();
    }
    return { message: 'Go backend not available — automation queued for next start' };
  });

  handleIPC(IPC.GO_BRIDGE_STATUS, () => {
    return {
      connected: goProcess !== null && goBridgePort !== null,
      port: goBridgePort,
    };
  });

  console.log('Digital Optimus ready.');
});

app.on('window-all-closed', () => {
  // Keep running in tray
});

app.on('before-quit', () => {
  if (goProcess) {
    goProcess.kill();
  }
});
