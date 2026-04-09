const { contextBridge, ipcRenderer } = require('electron');
const IPC = require('./src/shared/ipc-channels');

contextBridge.exposeInMainWorld('digitalOptimus', {
  // Screen Capture
  captureScreen: () => ipcRenderer.invoke(IPC.CAPTURE_SCREENSHOT),

  // Agent
  executeTask: (task) => ipcRenderer.invoke(IPC.AGENT_START, task),
  stopAgent: () => ipcRenderer.invoke(IPC.AGENT_STOP),
  getAgentStatus: () => ipcRenderer.invoke(IPC.AGENT_STATUS),

  // Automations
  getAutomations: () => ipcRenderer.invoke(IPC.GET_AUTOMATIONS),
  createAutomation: (data) => ipcRenderer.invoke(IPC.CREATE_AUTOMATION, data),
  runAutomation: (id) => ipcRenderer.invoke(IPC.RUN_AUTOMATION, id),

  // Tasks
  getTasks: () => ipcRenderer.invoke(IPC.GET_TASKS),
  createTask: (data) => ipcRenderer.invoke(IPC.CREATE_TASK, data),

  // CreatorSeal
  sealContent: (contentHash, metadata) => ipcRenderer.invoke(IPC.SEAL_CONTENT, contentHash, metadata),

  // Go Backend
  getGoBridgeStatus: () => ipcRenderer.invoke(IPC.GO_BRIDGE_STATUS),

  // Events (main -> renderer)
  onAgentLog: (callback) => {
    ipcRenderer.on(IPC.EVENT_AGENT_LOG, (event, data) => callback(data));
  },
  onTaskUpdate: (callback) => {
    ipcRenderer.on(IPC.EVENT_TASK_UPDATE, (event, data) => callback(data));
  },
  onCaptureReady: (callback) => {
    ipcRenderer.on(IPC.EVENT_CAPTURE_READY, (event, data) => callback(data));
  }
});
