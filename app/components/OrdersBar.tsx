'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { OrdersDayPoint } from '@/lib/metrics';
import { formatNumber } from '@/lib/metrics';

export function OrdersBar({ data }: { data: OrdersDayPoint[] }) {
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
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
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
          <YAxis stroke="var(--chart-axis)" fontSize={12} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'rgba(0,201,177,0.08)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as OrdersDayPoint;
              return (
                <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
                  <div className="text-slate-500 dark:text-slate-400">{label}</div>
                  <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {formatNumber(p.pedidos)} pedidos
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="pedidos" radius={[6, 6, 0, 0]} fill="#a78bfa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
