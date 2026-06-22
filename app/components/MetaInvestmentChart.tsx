'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MetaDayPoint } from '@/lib/metrics';
import { formatBRL } from '@/lib/metrics';

export function MetaInvestmentChart({ data }: { data: MetaDayPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        Sem dados.
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            stroke="var(--chart-axis)"
            fontSize={12}
            tickFormatter={(v) => {
              const [, m, d] = v.split('-');
              return `${d}/${m}`;
            }}
          />
          <YAxis
            stroke="var(--chart-axis)"
            fontSize={12}
            tickFormatter={(v) => formatBRL(Number(v)).replace('R$', '').trim()}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as MetaDayPoint;
              return (
                <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
                  <div className="text-slate-500 dark:text-slate-400">{label}</div>
                  <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {formatBRL(p.investimento)}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">{p.cliques} cliques</div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="investimento"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
