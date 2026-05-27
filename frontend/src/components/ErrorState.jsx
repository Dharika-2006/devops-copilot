// ============================================
// ErrorState.jsx — Error card matching Screen 3
// ============================================

export default function ErrorState({ error, onRetry }) {
  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.card}>
        {/* Error header */}
        <div style={styles.header}>
          <div style={styles.errorIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <div style={styles.errorTitle}>AGENT ERROR</div>
            <div style={styles.errorCode}>PARSE_EXCEPTION · {new Date().toISOString().slice(0, 19)}</div>
          </div>
        </div>

        {/* Error message */}
        <div style={styles.body}>
          <div style={styles.message}>
            {error || 'Could not parse command. Please try rephrasing.'}
          </div>

          {/* Suggested fix */}
          <div style={styles.suggestionBox}>
            <div style={styles.suggestionLabel}>SUGGESTED ACTION</div>
            <div style={styles.suggestionText}>
              Try rephrasing your command. Examples:
            </div>
            <div style={styles.examples}>
              <div style={styles.example}>$ scale backend to 5 replicas</div>
              <div style={styles.example}>$ deploy latest frontend</div>
              <div style={styles.example}>$ rollback deployment/web-v2</div>
              <div style={styles.example}>$ add redis service</div>
            </div>
          </div>
        </div>

        {/* Retry button */}
        <div style={styles.footer}>
          <button style={styles.retryBtn} onClick={onRetry}>
            ↩ TRY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    border: '1px solid var(--red)',
    background: '#1a0a0a',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderBottom: '1px solid #3a1010',
    background: '#200d0d',
  },
  errorIcon: {
    color: 'var(--red)',
    flexShrink: 0,
  },
  errorTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--red)',
    letterSpacing: '0.08em',
  },
  errorCode: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  message: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  suggestionBox: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    padding: '12px 14px',
  },
  suggestionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    marginBottom: '8px',
  },
  suggestionText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  examples: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  example: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--green)',
    padding: '2px 0',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #3a1010',
  },
  retryBtn: {
    background: 'transparent',
    border: '1px solid var(--red)',
    color: 'var(--red)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    padding: '8px 16px',
    cursor: 'pointer',
    letterSpacing: '0.08em',
    transition: 'background 0.15s',
  },
};
