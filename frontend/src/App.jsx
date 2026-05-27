// ============================================
// App.jsx — Root component
// Wires all panels together into the 3-column layout
// ============================================

import { useState } from 'react';
import { useCommandSession, STATUS } from './hooks/useCommandSession';

import Header from './components/Header';
import CommandHistory from './components/CommandHistory';
import IntentCard from './components/IntentCard';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import TerminalInput from './components/TerminalInput';
import SessionPanel from './components/SessionPanel';

export default function App() {
  const {
    status,
    currentResult,
    currentCommand,
    error,
    history,
    auditLog,
    activeStep,
    runCommand,
    reset,
  } = useCommandSession();

  const [prefillValue, setPrefillValue] = useState(undefined);

  const handleHistorySelect = (command) => {
    setPrefillValue(command);
    // Reset prefill after a tick so useEffect re-triggers on same value
    setTimeout(() => setPrefillValue(undefined), 100);
  };

  const handleSubmit = (command) => {
    runCommand(command);
  };

  return (
    <div style={styles.root}>
      {/* Top header bar */}
      <Header />

      {/* Main 3-column layout */}
      <div style={styles.body}>

        {/* LEFT: Command History */}
        <CommandHistory
          history={history}
          onSelect={handleHistorySelect}
        />

        {/* CENTER: Main content area */}
        <main style={styles.main}>
          {/* Content area (scrollable) */}
          <div style={styles.content}>
            {status === STATUS.LOADING && (
              <LoadingState
                command={currentCommand}
                activeStep={activeStep}
              />
            )}

            {status === STATUS.ERROR && (
              <ErrorState
                error={error}
                onRetry={reset}
              />
            )}

            {(status === STATUS.SUCCESS || status === STATUS.IDLE) && (
              <>
                <IntentCard result={currentResult} />

                {/* Cluster Topology placeholder */}
                {currentResult && (
                  <div style={styles.bottomCards}>
                    <div style={styles.miniCard}>
                      <div style={styles.miniCardTitle}>CLUSTER TOPOLOGY</div>
                      <ClusterTopologyPlaceholder />
                    </div>
                    <div style={styles.miniCard}>
                      <div style={styles.miniCardTitle}>RESOURCE_LOAD</div>
                      <div style={{ padding: '12px' }}>
                        <MiniBar label="CPU USAGE" value={42} />
                        <MiniBar label="MEMORY" value={68} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Terminal input — always visible at bottom */}
          <TerminalInput
            onSubmit={handleSubmit}
            isLoading={status === STATUS.LOADING}
            prefillValue={prefillValue}
          />
        </main>

        {/* RIGHT: Session details + audit log */}
        <SessionPanel
          result={currentResult}
          status={status}
          auditLog={auditLog}
        />
      </div>
    </div>
  );
}

// Simple cluster topology visualization
function ClusterTopologyPlaceholder() {
  const nodes = [
    { x: 50, y: 50 }, { x: 150, y: 30 }, { x: 230, y: 80 },
    { x: 180, y: 140 }, { x: 90, y: 130 }, { x: 270, y: 40 },
  ];
  const links = [[0,1],[1,2],[2,3],[3,4],[4,0],[1,5],[2,5]];

  return (
    <svg width="100%" height="120" viewBox="0 0 300 160" style={{ display: 'block' }}>
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="#238636" strokeWidth="1" opacity="0.4"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x} cy={n.y} r={i === 0 ? 8 : 5}
          fill={i === 0 ? '#3fb950' : '#238636'}
          opacity={i === 0 ? 1 : 0.7}
        />
      ))}
    </svg>
  );
}

function MiniBar({ label, value }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>{value}%</span>
      </div>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: 'var(--green)', borderRadius: '2px' }} />
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    background: 'var(--bg-main)',
    overflow: 'hidden',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid var(--border)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  bottomCards: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    background: 'var(--border)',
    margin: '0 12px 12px',
    border: '1px solid var(--border)',
  },
  miniCard: {
    background: 'var(--bg-card)',
    overflow: 'hidden',
  },
  miniCardTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    padding: '8px 12px',
    borderBottom: '1px solid var(--border)',
  },
};
