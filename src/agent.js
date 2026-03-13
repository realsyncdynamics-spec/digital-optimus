// Digital Optimus - Agent Core (System 1 + System 2)
// System 1: Fast reactive actions (click, type, scroll)
// System 2: Slow planning via LLM (goal decomposition)

class Agent {
  constructor(capture, api) {
    this.capture = capture;
    this.api = api;
    this.running = false;
    this.currentTask = null;
    this.stepLog = [];
  }

  async executeTask(goal) {
    this.running = true;
    this.stepLog = [];
    const taskId = await this.api.createTask(goal);
    this.currentTask = { id: taskId, goal, status: 'running' };

    try {
      // System 2: Plan steps from goal
      const plan = await this.planSteps(goal);

      for (let i = 0; i < plan.length; i++) {
        if (!this.running) break;
        const step = plan[i];

        // Take screenshot before action
        const screen = await this.capture.takeScreenshot();

        // System 1: Execute action
        const result = await this.executeStep(step, screen);

        // Log step
        const logEntry = {
          stepIndex: i,
          action: step.type,
          data: step,
          result,
          timestamp: Date.now()
        };
        this.stepLog.push(logEntry);
        await this.api.logStep(taskId, logEntry);

        // Wait between steps
        await this.wait(step.delay || 1000);
      }

      this.currentTask.status = 'completed';
      await this.api.updateTask(taskId, 'completed', { steps: this.stepLog.length });
      return { taskId, status: 'completed', steps: this.stepLog.length };

    } catch (err) {
      this.currentTask.status = 'error';
      await this.api.updateTask(taskId, 'error', { error: err.message });
      return { taskId, status: 'error', error: err.message };
    } finally {
      this.running = false;
    }
  }

  async planSteps(goal) {
    // System 2: LLM-based planning
    // TODO: Connect to Grok/OpenAI/local LLM
    // For MVP: predefined workflow templates
    const templates = {
      'youtube-upload-verify': [
        { type: 'navigate', url: 'https://studio.youtube.com', delay: 2000 },
        { type: 'screenshot', delay: 1000 },
        { type: 'detect', target: 'upload-button', delay: 500 },
        { type: 'click', target: 'upload-button', delay: 1000 },
        { type: 'seal', action: 'verify-content', delay: 500 }
      ],
      'creatorseal-batch': [
        { type: 'screenshot', delay: 500 },
        { type: 'hash', action: 'sha256', delay: 200 },
        { type: 'seal', action: 'sign-and-timestamp', delay: 1000 },
        { type: 'notify', message: 'Content sealed', delay: 500 }
      ],
      'default': [
        { type: 'screenshot', delay: 500 },
        { type: 'analyze', goal, delay: 1000 },
        { type: 'report', delay: 500 }
      ]
    };

    const key = Object.keys(templates).find(k => goal.toLowerCase().includes(k)) || 'default';
    return templates[key];
  }

  async executeStep(step, screen) {
    switch (step.type) {
      case 'screenshot': return { captured: true, hash: screen?.hash };
      case 'click': return { clicked: step.target };
      case 'type': return { typed: step.text };
      case 'navigate': return { navigated: step.url };
      case 'seal': return await this.api.createSealProof(screen?.hash || 'no-hash');
      case 'hash': return { hash: screen?.hash };
      case 'analyze': return { analysis: 'pending-llm' };
      case 'detect': return { detected: step.target };
      case 'notify': return { notified: step.message };
      case 'report': return { report: this.stepLog };
      default: return { unknown: step.type };
    }
  }

  stop() { this.running = false; }
  getStatus() { return { running: this.running, task: this.currentTask, steps: this.stepLog.length }; }
  wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}

module.exports = { Agent };
