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
    return <div className="py-8 text-center text-sm text-slate-500">Sem dados.</div>;
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={11}
            tickFormatter={(v) => formatBRL(Number(v)).replace('R$', '').trim()}
          />
          <YAxis
            type="category"
            dataKey="item"
            stroke="#cbd5e1"
            fontSize={12}
            width={160}
            tick={{ fill: '#cbd5e1' }}
            tickFormatter={(v) => (v.length > 22 ? `${v.slice(0, 22)}…` : v)}
          />
          <Tooltip
            cursor={{ fill: 'rgba(56,189,248,0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as ProductRow;
              return (
                <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl">
                  <div className="font-medium text-slate-100">{p.item}</div>
                  <div className="text-slate-400">{formatBRL(p.faturamento)}</div>
                  <div className="text-slate-400">{formatNumber(p.quantidade)} un.</div>
                </div>
              );
            }}
          />
          <Bar dataKey="faturamento" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#22d3ee' : '#0ea5e9'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
