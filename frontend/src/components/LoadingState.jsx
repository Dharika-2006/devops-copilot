// ============================================
// LoadingState.jsx — Agent pipeline steps
// Shows which agent is currently processing
// Matches Screen 2 from Stitch design
// ============================================

import { AGENT_STEPS } from '../api/intentApi';

export default function LoadingState({ command, activeStep }) {
  return (
    <div style={styles.container} className="fade-in">
      {/* Analyzing text with blinking cursor */}
      <div style={styles.analyzingRow}>
        <span style={styles.prompt}>&gt; </span>
        <span style={styles.analyzingText}>Analyzing command...</span>
        <span style={styles.cursor}>█</span>
      </div>

      {/* Progress line */}
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${((activeStep + 1) / AGENT_STEPS.length) * 100}%`,
          }}
        />
      </div>

      {/* Agent pipeline steps */}
      <div style={styles.steps}>
        {AGENT_STEPS.map((step, idx) => {
          const isDone = idx < activeStep;
          const isActive = idx === activeStep;
          const isPending = idx > activeStep;

          return (
            <div key={step.id} style={styles.stepRow}>
              {/* Step indicator */}
              <div style={styles.stepLeft}>
                <div style={{
                  ...styles.stepDot,
                  background: isActive ? 'var(--green)' : isDone ? 'var(--green-dim)' : 'transparent',
                  border: isDone
                    ? '2px solid var(--green-dim)'
                    : isActive
                    ? '2px solid var(--green)'
                    : '2px solid var(--text-muted)',
                }}>
                  {isDone && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                {idx < AGENT_STEPS.length - 1 && (
                  <div style={{
                    ...styles.connector,
                    background: isDone ? 'var(--green-dim)' : 'var(--border)',
                  }} />
                )}
              </div>

              {/* Step content */}
              <div style={styles.stepContent}>
                <div style={{
                  ...styles.stepLabel,
                  color: isActive
                    ? 'var(--green)'
                    : isDone
                    ? 'var(--text-secondary)'
                    : 'var(--text-muted)',
                }}>
                  {isActive && <span style={styles.activeDot}>● </span>}
                  {isDone && <span style={{ color: 'var(--green-dim)' }}>✓ </span>}
                  {isPending && <span style={{ color: 'var(--text-muted)' }}>○ </span>}
                  {step.label}
                  {isActive && <span style={styles.activeStatus}> — Parsing...</span>}
                  {isDone && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> — Complete</span>}
                  {isPending && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> — Waiting</span>}
                </div>
                <div style={styles.stepDesc}>{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thread info */}
      <div style={styles.threadInfo}>
        <span>THREAD_ID: 0x{Math.random().toString(16).substr(2, 5)}</span>
        <span>CPU_USAGE: {(Math.random() * 20 + 5).toFixed(1)}%</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  analyzingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  prompt: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    color: 'var(--text-muted)',
  },
  analyzingText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--green)',
  },
  cursor: {
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    color: 'var(--green)',
    animation: 'blink 1s step-end infinite',
    marginLeft: '2px',
  },
  progressBar: {
    height: '2px',
    background: 'var(--border)',
    borderRadius: '1px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--green)',
    transition: 'width 0.4s ease',
    borderRadius: '1px',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    marginTop: '8px',
  },
  stepRow: {
    display: 'flex',
    gap: '14px',
    minHeight: '60px',
  },
  stepLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '20px',
    flexShrink: 0,
  },
  stepDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#fff',
    transition: 'all 0.3s ease',
  },
  connector: {
    width: '2px',
    flex: 1,
    margin: '4px 0',
    transition: 'background 0.3s ease',
  },
  stepContent: {
    paddingBottom: '16px',
    paddingTop: '1px',
  },
  stepLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '4px',
    transition: 'color 0.3s ease',
  },
  activeDot: {
    animation: 'pulse 1s ease infinite',
    display: 'inline-block',
  },
  activeStatus: {
    color: 'var(--text-secondary)',
    fontWeight: 400,
  },
  stepDesc: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  threadInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border)',
    paddingTop: '10px',
    marginTop: 'auto',
  },
};
