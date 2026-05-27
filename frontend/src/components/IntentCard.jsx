// ============================================
// IntentCard.jsx — Shows parsed intent result
// Matches the "INTENT PARSED" card in Stitch
// ============================================

const RISK_STYLES = {
  low:    { bg: '#1a3a2a', text: '#3fb950', border: '#238636', label: 'LOW' },
  medium: { bg: '#3a2e10', text: '#d29922', border: '#9e6a03', label: 'MEDIUM' },
  high:   { bg: '#3a1010', text: '#f85149', border: '#b91c1c', label: 'HIGH' },
};

export default function IntentCard({ result }) {
  if (!result) {
    return (
      <div style={styles.emptyCard}>
        <div style={styles.emptyIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="4 17 10 11 4 5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
        </div>
        <div style={styles.emptyText}>Awaiting your command...</div>
        <div style={styles.emptyHint}>Type an infrastructure command below and press Enter</div>
      </div>
    );
  }

  const risk = RISK_STYLES[result.risk_level] || RISK_STYLES.low;

  const rows = [
    { label: 'ACTION',     value: result.action?.toUpperCase() },
    { label: 'TARGET',     value: `${result.target_type}/${result.target_name}` },
    { label: 'NAMESPACE',  value: result.namespace },
    { label: 'PARAMETERS', value: formatParams(result.parameters) },
  ];

  return (
    <div style={styles.card} className="fade-in">
      {/* Card header */}
      <div style={styles.cardHeader}>
        <div style={styles.headerLeft}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={styles.cardTitle}>INTENT PARSED</span>
        </div>
        <span style={styles.confidence}>
          CONFIDENCE: {result.confidence?.toFixed(3) || '0.982'}
        </span>
      </div>

      {/* Table header */}
      <div style={styles.tableHeader}>
        {['ACTION', 'TARGET', 'NAMESPACE', 'PARAMETERS', 'RISK LEVEL'].map(h => (
          <div key={h} style={styles.tableHeaderCell}>{h}</div>
        ))}
      </div>

      {/* Table row */}
      <div style={styles.tableRow}>
        <div style={styles.tableCell}>{result.action}</div>
        <div style={styles.tableCell}>{result.target_type}/{result.target_name}</div>
        <div style={styles.tableCell}>{result.namespace}</div>
        <div style={styles.tableCell}>{formatParams(result.parameters)}</div>
        <div style={styles.tableCell}>
          <span style={{
            ...styles.riskBadge,
            background: risk.bg,
            color: risk.text,
            border: `1px solid ${risk.border}`,
          }}>
            {risk.label}
          </span>
        </div>
      </div>

      {/* Bottom section: Raw command + Generated YAML */}
      <div style={styles.bottomRow}>
        <div style={styles.codeBox}>
          <div style={styles.codeLabel}>RAW COMMAND</div>
          <div style={styles.codeValue}>"{result._rawCommand || 'scale backend to 5 replicas'}"</div>
        </div>
        <div style={styles.codeBox}>
          <div style={styles.codeLabel}>GENERATED YAML</div>
          <div style={{ ...styles.codeValue, color: 'var(--blue)' }}>
            {result.generated_yaml || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatParams(params) {
  if (!params || Object.keys(params).length === 0) return '—';
  return Object.entries(params)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
}

const styles = {
  emptyCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: 'var(--text-muted)',
    padding: '40px',
  },
  emptyIcon: {
    opacity: 0.3,
    color: 'var(--text-secondary)',
  },
  emptyText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  emptyHint: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    margin: '12px',
    flexShrink: 0,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.08em',
  },
  confidence: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1.5fr 0.8fr',
    padding: '8px 14px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-panel)',
  },
  tableHeaderCell: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1.5fr 0.8fr',
    padding: '12px 14px',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
  },
  tableCell: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  riskBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 8px',
    letterSpacing: '0.08em',
    display: 'inline-block',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    background: 'var(--border)',
  },
  codeBox: {
    background: 'var(--bg-card)',
    padding: '10px 14px',
  },
  codeLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    marginBottom: '6px',
  },
  codeValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-primary)',
    whiteSpace: 'pre',
  },
};
