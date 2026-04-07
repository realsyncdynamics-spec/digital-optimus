// Shared IPC channel constants
// Used by both main.js and preload.js to guarantee channel name consistency.

module.exports = {
  // Agent
  AGENT_START: 'agent:start',
  AGENT_STOP: 'agent:stop',
  AGENT_STATUS: 'agent:status',

  // Screen Capture
  CAPTURE_SCREENSHOT: 'capture:screenshot',

  // API / Tasks
  GET_TASKS: 'api:tasks',
  CREATE_TASK: 'api:create-task',

  // Automations
  GET_AUTOMATIONS: 'api:automations',
  CREATE_AUTOMATION: 'api:create-automation',
  RUN_AUTOMATION: 'api:run-automation',

  // CreatorSeal
  SEAL_CONTENT: 'api:seal',

  // Go Backend Bridge
  GO_BRIDGE_STATUS: 'go:bridge-status',

  // Events (main -> renderer)
  EVENT_AGENT_LOG: 'agent-log',
  EVENT_TASK_UPDATE: 'task-update',
  EVENT_CAPTURE_READY: 'capture-ready',
};
