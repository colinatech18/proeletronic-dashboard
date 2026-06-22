'use client';

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProductRow } from '@/lib/metrics';
import { formatBRL, formatNumber } from '@/lib/metrics';

type Props = { data: ProductRow[] };

export function TopProducts({ data }: Props) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem dados.</div>;
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <XAxis
            type="number"
            stroke="var(--chart-axis)"
            fontSize={11}
            tickFormatter={(v) => formatBRL(Number(v)).replace('R$', '').trim()}
          />
          <YAxis
            type="category"
            dataKey="item"
            stroke="var(--chart-axis-strong)"
            fontSize={12}
            width={160}
            tickFormatter={(v) => (v.length > 22 ? `${v.slice(0, 22)}…` : v)}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,201,177,0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as ProductRow;
              return (
                <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{p.item}</div>
                  <div className="text-slate-500 dark:text-slate-400">{formatBRL(p.faturamento)}</div>
                  <div className="text-slate-500 dark:text-slate-400">{formatNumber(p.quantidade)} un.</div>
                </div>
              );
            }}
          />
          <Bar dataKey="faturamento" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#00C9B1' : '#1ad2b7'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
