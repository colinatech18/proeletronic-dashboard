'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatBRL, formatNumber } from '@/lib/metrics';
import type { SourceFunnel } from '@/lib/metrics';

type Props = {
  data: SourceFunnel[];
  selected?: string | null;
  onSelect?: (source: string) => void;
};

export function UtmBarChart({ data, selected, onSelect }: Props) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem dados.</div>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <XAxis dataKey="source" stroke="var(--chart-axis-strong)" fontSize={12} />
          <YAxis stroke="var(--chart-axis)" fontSize={12} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'rgba(0,201,177,0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as SourceFunnel;
              return (
                <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{p.source}</div>
                  <div className="text-slate-500 dark:text-slate-400">{formatNumber(p.pedidosPagos)} pedidos</div>
                  <div className="text-slate-500 dark:text-slate-400">{formatBRL(p.faturamento)}</div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="pedidosPagos"
            radius={[6, 6, 0, 0]}
            cursor={onSelect ? 'pointer' : undefined}
            onClick={
              onSelect
                ? (_d, _i, e) => {
                    const payload = (e as unknown as { payload?: { source: string } }).payload;
                    if (payload?.source) onSelect(payload.source);
                  }
                : undefined
            }
          >
            {data.map((row) => (
              <Cell
                key={row.source}
                fill={selected === row.source ? '#00C9B1' : '#1ad2b7'}
                opacity={!selected || selected === row.source ? 1 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
