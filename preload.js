const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('digitalOptimus', {
  // Screen Capture
  captureScreen: () => ipcRenderer.invoke('capture-screen'),

  // Agent
  executeTask: (task) => ipcRenderer.invoke('execute-task', task),
  getAgentStatus: () => ipcRenderer.invoke('get-agent-status'),

  // Automations
  getAutomations: () => ipcRenderer.invoke('get-automations'),
  createAutomation: (data) => ipcRenderer.invoke('create-automation', data),
  runAutomation: (id) => ipcRenderer.invoke('run-automation', id),

  // Tasks
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  createTask: (data) => ipcRenderer.invoke('create-task', data),

  // CreatorSeal
  sealContent: (contentHash, metadata) => ipcRenderer.invoke('seal-content', contentHash, metadata),

  // Events
  onAgentLog: (callback) => {
    ipcRenderer.on('agent-log', (event, data) => callback(data));
  },
  onTaskUpdate: (callback) => {
    ipcRenderer.on('task-update', (event, data) => callback(data));
  },
  onCaptureReady: (callback) => {
    ipcRenderer.on('capture-ready', (event, data) => callback(data));
  }
});
