// ============================================
// SessionPanel.jsx — Right sidebar
// Shows session info, audit log, cluster stats
// ============================================

const STATUS_STYLES = {
  SUCCESS:     { bg: '#1a3a2a', text: '#3fb950', border: '#238636' },
  PENDING:     { bg: '#3a2e10', text: '#d29922', border: '#9e6a03' },
  'ROLLED BACK': { bg: '#3a1010', text: '#f85149', border: '#b91c1c' },
  ERROR:       { bg: '#3a1010', text: '#f85149', border: '#b91c1c' },
  IDLE:        { bg: '#1c2128', text: '#8b949e', border: '#30363d' },
};

const LOG_LEVEL_COLORS = {
  SYSTEM: '#58a6ff',
  PARSER: '#3fb950',
  POLICY: '#d29922',
  EXEC:   '#bc8cff',
  INFO:   '#3fb950',
  ERROR:  '#f85149',
};

export default function SessionPanel({ result, status, auditLog }) {
  const sessionStatus = status === 'success'
    ? 'SUCCESS'
    : status === 'error'
    ? 'ERROR'
    : status === 'loading'
    ? 'PENDING'
    : 'IDLE';

  const statusStyle = STATUS_STYLES[sessionStatus] || STATUS_STYLES.IDLE;

  return (
    <aside style={styles.sidebar}>
      {/* Session Details */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>SESSION DETAILS</div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>SESSION_ID</span>
          <span style={{ ...styles.detailValue, color: 'var(--blue)' }}>
            {result?.session_id || '#——————'}
          </span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>STATUS</span>
          <span style={{
            ...styles.statusBadge,
            background: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
          }}>
            {sessionStatus === 'SUCCESS' && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: 4 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
            {sessionStatus}
          </span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>AGENT</span>
          <span style={styles.detailValue}>Intent Agent</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>LATENCY</span>
          <span style={styles.detailValue}>
            {result?.latency_ms ? `${result.latency_ms}ms` : '—'}
          </span>
        </div>
      </div>

      {/* Audit Log */}
      <div style={{ ...styles.section, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={styles.sectionTitle}>AUDIT LOG</div>
        <div style={styles.logList}>
          {auditLog.map((entry, idx) => (
            <div key={idx} style={styles.logEntry} className={idx === auditLog.length - 1 ? 'fade-in' : ''}>
              <span style={styles.logTime}>{entry.time}</span>
              <span style={{
                ...styles.logLevel,
                color: LOG_LEVEL_COLORS[entry.level] || 'var(--text-muted)',
              }}>
                [{entry.level}]
              </span>
              <span style={styles.logMsg}>{entry.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Load */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>RESOURCE_LOAD</div>
        <ResourceBar label="CPU USAGE" value={42} color="var(--green)" />
        <ResourceBar label="MEMORY" value={68} color="var(--blue)" />
      </div>

      {/* Active Environment */}
      <div style={styles.envSection}>
        <div style={styles.sectionTitle}>ACTIVE ENVIRONMENT</div>
        <div style={styles.envBox}>
          PROD_CLUSTER_01
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
        </div>
      </div>
    </aside>
  );
}

function ResourceBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>
          {value}%
        </span>
      </div>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          background: color,
          borderRadius: '2px',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-right-width)',
    background: 'var(--bg-panel)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  section: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    marginBottom: '10px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  detailLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  detailValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  statusBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    letterSpacing: '0.06em',
    display: 'flex',
    alignItems: 'center',
  },
  logList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  logEntry: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    lineHeight: 1.6,
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
  },
  logTime: {
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  logLevel: {
    fontWeight: 600,
    flexShrink: 0,
  },
  logMsg: {
    color: 'var(--text-secondary)',
  },
  envSection: {
    padding: '10px 14px',
  },
  envBox: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    padding: '8px 10px',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-secondary)',
  },
};
