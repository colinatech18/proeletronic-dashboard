'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { RevenueShare } from '@/lib/metrics';
import { formatBRL, formatPercent } from '@/lib/metrics';

const COLORS = ['#00C9B1', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#22d3ee', '#fb7185', '#94a3b8'];

type Props = { data: RevenueShare[] };

export function ChannelDistribution({ data }: Props) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem dados.</div>;
  }

  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="faturamento"
              nameKey="source"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              stroke="var(--chart-grid)"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as RevenueShare;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{p.source}</div>
                    <div className="text-slate-500 dark:text-slate-400">{formatBRL(p.faturamento)}</div>
                    <div className="text-slate-500 dark:text-slate-400">{formatPercent(p.share)}</div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2">
        {data.slice(0, 6).map((row, i) => (
          <li key={row.source} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-slate-700 dark:text-slate-200">{row.source}</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatBRL(row.faturamento)} · {formatPercent(row.share)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
