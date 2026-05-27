// ============================================
// TerminalInput.jsx — Bottom command input bar
// Matches the $ input with RUN button in Stitch
// ============================================

import { useState, useRef, useEffect } from 'react';

export default function TerminalInput({ onSubmit, isLoading, prefillValue }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Prefill when user clicks history item
  useEffect(() => {
    if (prefillValue !== undefined) {
      setValue(prefillValue);
      inputRef.current?.focus();
    }
  }, [prefillValue]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setValue('');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.inputRow}>
        {/* $ prefix */}
        <span style={styles.prefix}>$</span>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type an infrastructure command... e.g. scale backend to 5 replicas"
          disabled={isLoading}
          style={{
            ...styles.input,
            opacity: isLoading ? 0.5 : 1,
          }}
        />

        {/* Loading indicator or run button */}
        {isLoading ? (
          <div style={styles.loadingIndicator}>
            <div style={styles.loadingDots}>
              <span style={{ ...styles.dot, animationDelay: '0s' }} />
              <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
              <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
            </div>
          </div>
        ) : (
          <button
            style={{
              ...styles.runBtn,
              opacity: value.trim() ? 1 : 0.5,
              cursor: value.trim() ? 'pointer' : 'default',
            }}
            onClick={handleSubmit}
            disabled={!value.trim()}
          >
            RUN
          </button>
        )}
      </div>

      {/* Hint text */}
      <div style={styles.hint}>
        Press <kbd style={styles.kbd}>Enter</kbd> to run
        &nbsp;·&nbsp;
        <kbd style={styles.kbd}>Esc</kbd> to clear
        &nbsp;·&nbsp;
        <span style={{ color: 'var(--text-muted)' }}>ACTIVE_ENV: PROD_CLUSTER_01</span>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-input)',
    padding: '0 12px 6px',
    flexShrink: 0,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0 6px',
  },
  prefix: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--green)',
    flexShrink: 0,
    userSelect: 'none',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    caretColor: 'var(--green)',
    '::placeholder': { color: 'var(--text-muted)' },
  },
  runBtn: {
    background: 'var(--green)',
    border: 'none',
    color: '#0d1117',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 700,
    padding: '6px 16px',
    letterSpacing: '0.1em',
    flexShrink: 0,
    transition: 'opacity 0.15s',
  },
  loadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    flexShrink: 0,
  },
  loadingDots: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--green)',
    display: 'inline-block',
    animation: 'pulse 1s ease infinite',
  },
  hint: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
    paddingBottom: '4px',
  },
  kbd: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '2px',
    padding: '1px 5px',
    fontSize: '9px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
};
