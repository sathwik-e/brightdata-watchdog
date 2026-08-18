'use client';

import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LogEvent {
  time: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Log color mapping
// ---------------------------------------------------------------------------

function getLogColor(line: string): string {
  if (line.includes('BRIGHT_DATA_AI')) return '#8884d8';
  if (line.includes('ALERT') || line.includes('CRITICAL') || line.includes('BROKEN')) return '#ff6b6b';
  if (line.includes('WEBHOOK') || line.includes('INGEST')) return '#F5A623';
  if (line.includes('SYSTEM')) return '#10B981';
  return '#a6accd';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LiveStream() {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll /api/status for new events every 2 seconds
  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        const data = await res.json();
        if (mounted && data.events) {
          setEvents(data.events);
        }
      } catch {
        // Silently ignore
      }
    };

    // Initial fetch
    poll();

    const interval = setInterval(poll, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="bento-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
      {/* Terminal title bar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '8px', fontFamily: 'monospace' }}>
          ~/pipeline/bright-data-stream
        </span>
      </div>

      {/* Log output */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          fontFamily: '"Fira Code", monospace',
          fontSize: '13px',
          color: '#10B981',
          lineHeight: '1.6',
        }}
      >
        {events.length === 0 ? (
          <div style={{ color: '#a6accd', opacity: 0.6 }}>
            <div>[SYSTEM] Watchdog pipeline initialized</div>
            <div>[SYSTEM] Listening on /api/ingest for Bright Data webhooks...</div>
          </div>
        ) : (
          events.map((event, i) => (
            <div
              key={`${event.time}-${i}`}
              style={{
                color: getLogColor(event.message),
                animation: i === events.length - 1 ? 'fadeIn 0.3s ease-in' : undefined,
              }}
            >
              <span style={{ color: '#555', marginRight: '8px' }}>{formatTime(event.time)}</span>
              {event.message}
            </div>
          ))
        )}

        {/* Blinking cursor */}
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>$</span>
          <span style={{
            width: '8px',
            height: '16px',
            backgroundColor: '#10B981',
            display: 'inline-block',
            animation: 'blink 1s step-end infinite',
          }} />
        </div>
      </div>
    </div>
  );
}
