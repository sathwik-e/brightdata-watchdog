import ScraperHealth from '@/components/ScraperHealth';
import AnomalyChart from '@/components/AnomalyChart';
import LiveStream from '@/components/LiveStream';
import { getItems } from '@/lib/storage';
import { ScrapedItem } from '@/types/scraper';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function calcSpike(item: ScrapedItem): number | null {
  if (!item.originalPrice) return null;
  return ((item.price - item.originalPrice) / item.originalPrice) * 100;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default async function Dashboard() {
  const items = await getItems();

  // Aggregate stats for the bento cards
  let gougingCount = 0;
  let highestSpike = 0;

  for (const item of items) {
    const spike = calcSpike(item);
    if (spike === null) continue;
    if (spike > 50) gougingCount++;
    if (spike > highestSpike) highestSpike = spike;
  }

  return (
    <>
      <div className="ambient-bg" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '8px' }}>
              Watchdog Command
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Real-time emergency supply monitoring and anomaly detection.
            </p>
          </div>
          <ScraperHealth status="healthy" lastRun="Live" />
        </header>

        {/* Stat Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <StatCard label="Items Tracked" value={String(items.length)} />
          <StatCard
            label="Active Gouging"
            value={String(gougingCount)}
            color={gougingCount > 0 ? '#ff6b6b' : undefined}
            badge={gougingCount > 0 ? { text: 'Critical', className: 'badge badge-red' } : undefined}
          />
          <StatCard
            label="Highest Spike"
            value={`+${highestSpike.toFixed(0)}%`}
            color={highestSpike > 50 ? '#ff6b6b' : undefined}
          />
          <StatCard
            label="AI Healing Events"
            value="1"
            color="#8884d8"
            badge={{ text: 'Active', className: 'badge', style: { background: 'rgba(136, 132, 216, 0.2)', color: '#8884d8', borderColor: 'rgba(136, 132, 216, 0.3)' } }}
          />
        </section>

        {/* Chart + Terminal */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
          <div className="bento-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              Price Gouging Trajectory
            </div>
            <AnomalyChart items={items} />
          </div>
          <LiveStream items={items} />
        </section>

        {/* Item List */}
        <section>
          <div className="command-palette" style={{ marginBottom: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ opacity: 0.7 }}>Filter anomalies by retailer or status...</span>
          </div>

          <div className="bento-card">
            <div className="raycast-list">
              {items.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No data collected yet. Awaiting Bright Data webhook...
                </div>
              ) : (
                items.map((item: ScrapedItem) => {
                  const spike = calcSpike(item);
                  const isGouging = spike !== null && spike > 50;

                  return (
                    <div key={item.id} className="raycast-item">
                      {/* Left: indicator + name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isGouging ? '#ff6b6b' : 'var(--border-hover)' }} />
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.name}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {item.retailer} / {item.id}
                            {isGouging && (
                              <span style={{ color: '#F5A623', fontSize: '11px', fontWeight: 600, padding: '2px 6px', background: 'rgba(245, 166, 35, 0.1)', borderRadius: '4px' }}>
                                Slack Alert Sent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: price + status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, justifyContent: 'flex-end' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                            <span style={{ fontWeight: 600, color: isGouging ? '#ff6b6b' : 'var(--text-primary)', fontSize: '15px' }}>
                              {formatCurrency(item.price)}
                            </span>
                            {spike !== null && (
                              <span className={isGouging ? 'badge badge-red' : 'badge badge-neutral'}>
                                +{spike.toFixed(0)}%
                              </span>
                            )}
                          </div>
                          {item.originalPrice && (
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px', textDecoration: 'line-through' }}>
                              {formatCurrency(item.originalPrice)}
                            </div>
                          )}
                        </div>

                        <div style={{ width: '90px', textAlign: 'right' }}>
                          <span className={item.inStock ? 'badge badge-green' : 'badge badge-red'}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                            {item.inStock ? 'In Stock' : 'Out'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Stat Card
// ---------------------------------------------------------------------------

interface BadgeConfig {
  text: string;
  className: string;
  style?: React.CSSProperties;
}

interface StatCardProps {
  label: string;
  value: string;
  color?: string;
  badge?: BadgeConfig;
}

function StatCard({ label, value, color, badge }: StatCardProps) {
  return (
    <div className="bento-card" style={{ padding: '32px' }}>
      <div style={{ color: 'var(--text-tertiary)', fontSize: '14px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: color ?? 'var(--text-primary)' }}>
          {value}
        </span>
        {badge && (
          <span className={badge.className} style={{ transform: 'translateY(4px)', ...badge.style }}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}
