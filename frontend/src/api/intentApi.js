// ============================================
// intentApi.js — API layer with mock mode
// Flip USE_MOCK = false when backend is ready
// ============================================

const USE_MOCK = true; // ← change to false when backend runs

// Simulates realistic agent processing delay
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Mock responses for different command types
const getMockResponse = (command) => {
  const lower = command.toLowerCase();

  if (lower.includes('scale')) {
    const match = lower.match(/(\d+)/);
    const replicas = match ? parseInt(match[1]) : 3;
    return {
      action: 'scale',
      target_type: 'deployment',
      target_name: lower.includes('frontend') ? 'frontend' : 'backend',
      namespace: 'default',
      parameters: { replicas },
      risk_level: replicas > 10 ? 'high' : replicas > 5 ? 'medium' : 'low',
      confidence: 0.982,
      generated_yaml: `spec:\n  replicas: ${replicas}`,
      session_id: '#' + Math.random().toString(36).substr(2, 6),
      latency_ms: Math.floor(Math.random() * 200) + 100,
    };
  }

  if (lower.includes('deploy')) {
    return {
      action: 'deploy',
      target_type: 'deployment',
      target_name: lower.includes('frontend') ? 'frontend' : 'backend',
      namespace: 'default',
      parameters: { image: 'myapp/backend:latest' },
      risk_level: 'medium',
      confidence: 0.951,
      generated_yaml: `image: myapp/backend:latest`,
      session_id: '#' + Math.random().toString(36).substr(2, 6),
      latency_ms: Math.floor(Math.random() * 200) + 100,
    };
  }

  if (lower.includes('rollback')) {
    return {
      action: 'rollback',
      target_type: 'deployment',
      target_name: lower.includes('frontend') ? 'frontend' : lower.includes('web') ? 'web-v2' : 'backend',
      namespace: 'default',
      parameters: { revision: 'previous' },
      risk_level: 'medium',
      confidence: 0.967,
      generated_yaml: `rollout: undo\ntarget: deployment/backend`,
      session_id: '#' + Math.random().toString(36).substr(2, 6),
      latency_ms: Math.floor(Math.random() * 200) + 100,
    };
  }

  if (lower.includes('redis') || lower.includes('add')) {
    return {
      action: 'add_service',
      target_type: 'service',
      target_name: 'redis',
      namespace: 'default',
      parameters: { port: 6379, type: 'ClusterIP' },
      risk_level: 'low',
      confidence: 0.934,
      generated_yaml: `kind: Service\nname: redis\nport: 6379`,
      session_id: '#' + Math.random().toString(36).substr(2, 6),
      latency_ms: Math.floor(Math.random() * 200) + 100,
    };
  }

  if (lower.includes('log')) {
    return {
      action: 'logs',
      target_type: 'deployment',
      target_name: lower.includes('auth') ? 'auth-service' : 'backend',
      namespace: 'default',
      parameters: { tail: 100 },
      risk_level: 'low',
      confidence: 0.978,
      generated_yaml: `kubectl logs deployment/auth-service --tail=100`,
      session_id: '#' + Math.random().toString(36).substr(2, 6),
      latency_ms: Math.floor(Math.random() * 200) + 100,
    };
  }

  // Default fallback
  return {
    action: 'unknown',
    target_type: 'deployment',
    target_name: 'unknown',
    namespace: 'default',
    parameters: {},
    risk_level: 'low',
    confidence: 0.5,
    generated_yaml: '',
    session_id: '#' + Math.random().toString(36).substr(2, 6),
    latency_ms: Math.floor(Math.random() * 200) + 100,
  };
};

// Mock audit log entries generated per command
export const getMockAuditLog = (action) => {
  const now = new Date();
  const fmt = (d) => d.toTimeString().substr(0, 8);
  const t = (offset) => fmt(new Date(now.getTime() + offset * 1000));

  return [
    { time: t(0), level: 'SYSTEM', msg: 'Request received' },
    { time: t(1), level: 'PARSER', msg: 'Syntax analysis: OK' },
    { time: t(1), level: 'POLICY', msg: 'Validation check...' },
    { time: t(2), level: 'POLICY', msg: `ALLOWED (${action?.toUpperCase() || 'LOW'}_RISK)` },
    { time: t(3), level: 'EXEC', msg: `Executing ${action || 'command'}...` },
    { time: t(4), level: 'EXEC', msg: 'Waiting for rollout...' },
    { time: t(10), level: 'SYSTEM', msg: 'Session completed' },
  ];
};

// Agent pipeline steps for loading state
export const AGENT_STEPS = [
  { id: 'intent', label: 'Intent Agent', desc: 'Determining scale parameters and target context.' },
  { id: 'planner', label: 'Planner Agent', desc: 'Pending strategy formulation for rollout.' },
  { id: 'safety', label: 'Safety Agent', desc: 'Awaiting pre-deployment risk assessment.' },
  { id: 'executor', label: 'Executor Agent', desc: 'Final deployment execution stage.' },
];

// ── Main export ──────────────────────────────────────────
export async function parseIntent(command) {
  if (USE_MOCK) {
    // Simulate realistic processing time (1.2–2s)
    await delay(1200 + Math.random() * 800);
    return getMockResponse(command);
  }

  // Real API call — used when backend is running
  const res = await fetch('/api/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }

  return res.json();
}
