// Digital Optimus - API Module
// Connects Desktop Agent to Supabase + CreatorSeal

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oipyyzwobkcuhihpqmoj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

class API {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  // === TASKS ===
  async createTask(goal) {
    const { data, error } = await this.supabase
      .from('do_tasks')
      .insert({ goal, status: 'running', started_at: new Date().toISOString() })
      .select('id')
      .single();
    if (error) throw new Error(`Task create failed: ${error.message}`);
    return data.id;
  }

  async updateTask(taskId, status, result = {}) {
    const update = { status, result };
    if (status === 'completed' || status === 'error') update.completed_at = new Date().toISOString();
    const { error } = await this.supabase.from('do_tasks').update(update).eq('id', taskId);
    if (error) console.error('Task update failed:', error.message);
  }

  async getTasks(limit = 20) {
    const { data, error } = await this.supabase
      .from('do_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return error ? [] : data;
  }

  // === AGENT LOGS ===
  async logStep(taskId, entry) {
    const { error } = await this.supabase.from('do_agent_logs').insert({
      task_id: taskId,
      step_index: entry.stepIndex,
      action_type: entry.action,
      action_data: entry.data,
      result: entry.result,
      duration_ms: entry.duration || 0
    });
    if (error) console.error('Log step failed:', error.message);
  }

  async getTaskLogs(taskId) {
    const { data, error } = await this.supabase
      .from('do_agent_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('step_index');
    return error ? [] : data;
  }

  // === CREATORSEAL INTEGRATION ===
  async createSealProof(contentHash) {
    // Generate Ed25519-style signature (simplified for MVP)
    const signature = crypto.createHmac('sha256', 'digital-optimus-key')
      .update(contentHash)
      .digest('hex');

    const proof = {
      content_hash: contentHash,
      signature,
      trust_score: 90,
      sealed_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('do_seal_proofs')
      .insert(proof)
      .select('id')
      .single();

    if (error) throw new Error(`Seal proof failed: ${error.message}`);
    return { proofId: data.id, ...proof };
  }

  async getSealProofs(limit = 20) {
    const { data, error } = await this.supabase
      .from('do_seal_proofs')
      .select('*')
      .order('sealed_at', { ascending: false })
      .limit(limit);
    return error ? [] : data;
  }

  // === AUTOMATIONS ===
  async getAutomations() {
    const { data, error } = await this.supabase
      .from('do_automations')
      .select('*')
      .order('created_at', { ascending: false });
    return error ? [] : data;
  }

  async createAutomation(name, description, steps, triggerType = 'manual') {
    const { data, error } = await this.supabase
      .from('do_automations')
      .insert({ name, description, steps, trigger_type: triggerType })
      .select('id')
      .single();
    if (error) throw new Error(`Automation create failed: ${error.message}`);
    return data.id;
  }
}

module.exports = { API };
