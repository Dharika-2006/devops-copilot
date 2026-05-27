// ============================================
// useCommandSession.js
// Manages the full lifecycle of a command:
// idle → loading → success / error
// Also maintains command history (last 10)
// ============================================

import { useState, useCallback } from 'react';
import { parseIntent, getMockAuditLog } from '../api/intentApi';

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export function useCommandSession() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [currentResult, setCurrentResult] = useState(null);
  const [currentCommand, setCurrentCommand] = useState('');
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([
    // Pre-seeded history to match the Stitch design
    {
      id: 1,
      command: 'scale backend to 5 repl...',
      action: 'scale',
      result: null,
      timestamp: '2 min ago',
    },
    {
      id: 2,
      command: 'check logs for auth-service',
      action: 'logs',
      result: null,
      timestamp: '15 min ago',
    },
    {
      id: 3,
      command: 'rollback deployment/web-v2',
      action: 'rollback',
      result: null,
      timestamp: '1 hour ago',
    },
  ]);
  const [auditLog, setAuditLog] = useState([
    { time: '14:22:01', level: 'SYSTEM', msg: 'Request received' },
    { time: '14:22:02', level: 'PARSER', msg: 'Syntax analysis: OK' },
    { time: '14:22:02', level: 'POLICY', msg: 'Validation check...' },
    { time: '14:22:03', level: 'POLICY', msg: 'ALLOWED (LOW_RISK)' },
    { time: '14:22:04', level: 'EXEC', msg: 'scaling replicas → 5' },
    { time: '14:22:05', level: 'EXEC', msg: 'Waiting for rollout...' },
    { time: '14:23:10', level: 'SYSTEM', msg: 'Session completed' },
  ]);
  const [activeStep, setActiveStep] = useState(-1); // which agent step is active

  const runCommand = useCallback(async (command) => {
    if (!command.trim()) return;

    setStatus(STATUS.LOADING);
    setCurrentCommand(command);
    setError(null);
    setCurrentResult(null);
    setActiveStep(0); // Intent Agent starts

    // Simulate agent steps progressing
    const stepTimers = [
      setTimeout(() => setActiveStep(1), 400),  // Planner
      setTimeout(() => setActiveStep(2), 800),  // Safety
      setTimeout(() => setActiveStep(3), 1100), // Executor
    ];

    try {
      const result = await parseIntent(command);

      // Clear timers
      stepTimers.forEach(clearTimeout);
      setActiveStep(-1);

      setCurrentResult(result);
      setStatus(STATUS.SUCCESS);

      // Generate audit log for this command
      const newLog = getMockAuditLog(result.action);
      setAuditLog(newLog);

      // Add to history (keep max 10)
      setHistory((prev) => {
        const entry = {
          id: Date.now(),
          command: command.length > 28 ? command.slice(0, 28) + '...' : command,
          action: result.action,
          result,
          timestamp: 'just now',
        };
        return [entry, ...prev].slice(0, 10);
      });
    } catch (err) {
      stepTimers.forEach(clearTimeout);
      setActiveStep(-1);
      setError(err.message || 'Agent could not parse command');
      setStatus(STATUS.ERROR);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setCurrentResult(null);
    setError(null);
    setCurrentCommand('');
    setActiveStep(-1);
  }, []);

  return {
    status,
    currentResult,
    currentCommand,
    error,
    history,
    auditLog,
    activeStep,
    runCommand,
    reset,
  };
}
