// ============================================
// CommandHistory.jsx — Left sidebar
// Shows last 10 commands with action badges
// ============================================

const ACTION_COLORS = {
  scale:       { bg: '#1f3a5f', text: '#58a6ff', label: 'SCALE' },
  deploy:      { bg: '#1a3a2a', text: '#3fb950', label: 'DEPLOY' },
  rollback:    { bg: '#3a2010', text: '#e3b341', label: 'ROLLBACK' },
  add_service: { bg: '#2d1f5e', text: '#bc8cff', label: 'ADD SVC' },
  logs:        { bg: '#1c2d1c', text: '#3fb950', label: 'LOGS' },
  unknown:     { bg: '#2a2a2a', text: '#8b949e', label: 'UNKNOWN' },
};

export default function CommandHistory({ history, onSelect }) {
  return (
    <aside style={styles.sidebar}>
      {/* Title */}
      <div style={styles.titleRow}>
        <span style={styles.title}>COMMAND HISTORY</span>
      </div>

      {/* New Session Button */}
      <button style={styles.newSessionBtn} onClick={() => onSelect('')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        NEW SESSION
      </button>

      {/* History list */}
      <div style={styles.list}>
        {history.map((item, idx) => {
          const badge = ACTION_COLORS[item.action] || ACTION_COLORS.unknown;
          return (
            <div
              key={item.id}
              style={{
                ...styles.item,
                ...(idx === 0 ? styles.itemActive : {}),
              }}
              onClick={() => onSelect(item.command)}
            >
              {idx === 0 && <div style={styles.activeBar} />}
              <div style={styles.commandText}>{item.command}</div>
              <div style={styles.itemMeta}>
                <span style={{
                  ...styles.badge,
                  background: badge.bg,
                  color: badge.text,
                }}>
                  {badge.label}
                </span>
                <span style={styles.timestamp}>{item.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom node info */}
      <div style={styles.nodeInfo}>
        <div style={styles.nodeRow}>
          <span style={styles.nodeId}>N1</span>
          <div>
            <div style={styles.nodeName}>NODE_01_PROD</div>
            <div style={styles.nodeStatus}>STATUS: <span style={{ color: 'var(--green)' }}>AGENT_ONLINE</span></div>
          </div>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-left-width)',
    background: 'var(--bg-panel)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  titleRow: {
    padding: '12px 14px 8px',
    borderBottom: '1px solid var(--border)',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
  },
  newSessionBtn: {
    margin: '10px 12px',
    padding: '8px 12px',
    background: 'transparent',
    border: '1px solid var(--green)',
    color: 'var(--green)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: 'calc(100% - 24px)',
    transition: 'background 0.15s',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 0',
  },
  item: {
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border)',
    position: 'relative',
    transition: 'background 0.15s',
  },
  itemActive: {
    background: 'var(--bg-hover)',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '2px',
    background: 'var(--green)',
  },
  commandText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-primary)',
    marginBottom: '6px',
    lineHeight: 1.4,
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    fontWeight: 700,
    padding: '2px 6px',
    letterSpacing: '0.08em',
  },
  timestamp: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  nodeInfo: {
    borderTop: '1px solid var(--border)',
    padding: '10px 14px',
  },
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  nodeId: {
    width: '24px',
    height: '24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  nodeName: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  nodeStatus: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
};
