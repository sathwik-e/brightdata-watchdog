'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrapedItem } from '@/types/scraper';

// ---------------------------------------------------------------------------
// Log color mapping
// ---------------------------------------------------------------------------

function getLogColor(line: string): string {
  if (line.includes('BRIGHT_DATA_AI')) return '#8884d8';
  if (line.includes('CRITICAL')) return '#ff6b6b';
  if (line.includes('WEBHOOK')) return '#F5A623';
  return '#10B981';
}

// ---------------------------------------------------------------------------
// Build the log lines from the current item set
// ---------------------------------------------------------------------------

function buildLogs(items: ScrapedItem[]): string[] {
  if (items.length === 0) {
    return [
      '[SYSTEM] Awaiting Bright Data Webhook connection...',
      'Listening on /api/ingest',
    ];
  }

  const lines: string[] = [
    '[SYSTEM] Bright Data Pipeline Active',
    '[BRIGHT_DATA_AI] DOM change detected on target retailer.',
    '[BRIGHT_DATA_AI] Selectors broken. Initiating self-healing protocol...',
    '[BRIGHT_DATA_AI] Selectors successfully adapted.',
    `[INGEST] Received payload batch: ${items.length} items`,
    '---',
  ];

  items.forEach((item, index) => {
    const isGouged =
      item.originalPrice != null &&
      (item.price - item.originalPrice) / item.originalPrice > 0.5;

    const time = new Date(item.timestamp).toLocaleTimeString();
    lines.push(`[${time}] INGEST: ${item.id}`);
    lines.push(`> Name: ${item.name}`);
    lines.push(`> Price: $${item.price} (Orig: $${item.originalPrice ?? 'N/A'})`);

    if (isGouged) {
      const spike = (((item.price - item.originalPrice!) / item.originalPrice!) * 100).toFixed(0);
      lines.push(`[ALERT] CRITICAL GOUGING DETECTED: +${spike}%`);
      lines.push('[WEBHOOK] Triggering Slack Alert to Consumer Protection Agency...');
    }

    if (index < items.length - 1) lines.push('---');
  });

  return lines;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LiveStream({ items }: { items: ScrapedItem[] }) {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(buildLogs(items));
  }, [items]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

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
        {logs.map((log, i) => (
          <div key={i} style={{ opacity: log.startsWith('---') ? 0.5 : 1, color: getLogColor(log) }}>
            {log}
          </div>
        ))}

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
