import React from 'react';

// ---------------------------------------------------------------------------
// Status configuration
// ---------------------------------------------------------------------------

type StatusType = 'healthy' | 'healing' | 'broken';

interface StatusConfig {
  color: string;
  label: string;
  pulse: boolean;
}

const STATUS_MAP: Record<StatusType, StatusConfig> = {
  healthy: { color: 'var(--accent-green)', label: 'Operational', pulse: true },
  healing: { color: 'var(--accent-orange)', label: 'Self-Healing', pulse: true },
  broken: { color: 'var(--accent-red)', label: 'Selectors Broken', pulse: false },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ScraperHealthProps {
  status?: StatusType;
  lastRun?: string;
}

export default function ScraperHealth({ status = 'healthy', lastRun = '2 mins ago' }: ScraperHealthProps) {
  const config = STATUS_MAP[status] ?? { color: 'var(--text-tertiary)', label: 'Unknown', pulse: false };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '32px',
    }}>
      {/* Left: Status indicator + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '12px' }}>
          {config.pulse && (
            <span style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: config.color,
              borderRadius: '50%',
              opacity: 0.4,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
          )}
          <span style={{
            position: 'relative',
            width: '8px',
            height: '8px',
            backgroundColor: config.color,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${config.color}`,
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Bright Data Scraper Studio
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Status: <span style={{ color: config.color }}>{config.label}</span>
          </span>
        </div>
      </div>

      {/* Right: Last run timestamp */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Last Pipeline Run
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {lastRun}
        </div>
      </div>
    </div>
  );
}
