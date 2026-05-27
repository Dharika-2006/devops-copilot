// ============================================
// Header.jsx — Top navigation bar
// Shows: Logo | Status | Icons | Avatar
// ============================================

import { useState, useEffect } from 'react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={styles.header}>
      {/* Left: Logo + version */}
      <div style={styles.left}>
        <span style={styles.logo}>DevOps Copilot</span>
        <span style={styles.version}>v1.0</span>
      </div>

      {/* Center: Agent status */}
      <div style={styles.center}>
        <span style={styles.dot} />
        <span style={styles.agentLabel}>AGENT_ONLINE</span>
      </div>

      {/* Right: Icons + time + avatar */}
      <div style={styles.right}>
        <span style={styles.timeLabel}>
          {time.toTimeString().slice(0, 8)}
        </span>
        <div style={styles.iconBtn} title="Broadcast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2"/>
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49"/>
            <path d="M7.76 7.76a6 6 0 0 0 0 8.49"/>
            <path d="M20.66 3.34a12 12 0 0 1 0 17.32"/>
            <path d="M3.34 3.34a12 12 0 0 0 0 17.32"/>
          </svg>
        </div>
        <div style={styles.iconBtn} title="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div style={styles.iconBtn} title="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <div style={styles.avatar}>D</div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 'var(--header-height)',
    background: 'var(--bg-panel)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--green)',
    letterSpacing: '0.05em',
  },
  version: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    padding: '1px 6px',
    borderRadius: '2px',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--green)',
    animation: 'pulse 2s ease infinite',
    display: 'inline-block',
  },
  agentLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--green)',
    fontWeight: 600,
    letterSpacing: '0.08em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timeLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  iconBtn: {
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.15s, background 0.15s',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--green-dim)',
    border: '1px solid var(--green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--green)',
    cursor: 'pointer',
  },
};
