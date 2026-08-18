'use client';

import { ScrapedItem } from '@/types/scraper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOUGING_THRESHOLD = 100; // percentage spike above which bars turn red
const BAR_COLOR_HIGH = '#ff6b6b';
const BAR_COLOR_LOW = '#F5A623';

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(20, 20, 20, 0.9)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnomalyChart({ items }: { items: ScrapedItem[] }) {
  const data = items.map((item) => {
    const spike = item.originalPrice
      ? ((item.price - item.originalPrice) / item.originalPrice) * 100
      : 0;

    return {
      name: item.name.split(' ')[0],
      spike: parseFloat(spike.toFixed(1)),
    };
  });

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `+${v}%`}
            dx={-10}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
            contentStyle={TOOLTIP_STYLE}
            itemStyle={{ color: BAR_COLOR_HIGH, fontWeight: 'bold' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`+${value}%`, 'Spike']}
          />
          <Bar dataKey="spike" name="Spike Percentage" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.spike > GOUGING_THRESHOLD ? BAR_COLOR_HIGH : BAR_COLOR_LOW} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
