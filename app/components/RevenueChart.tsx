'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenuePoint } from '@/lib/metrics';
import { formatBRL } from '@/lib/metrics';

type Props = { data: RevenuePoint[] };

export function RevenueChart({ data }: Props) {
  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(v) => formatTick(v)}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(v) => formatBRL(Number(v)).replace('R$', '').trim()}
          />
          <Tooltip content={<RevenueTooltip />} />
          <Area
            type="monotone"
            dataKey="faturamento"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#revGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatTick(value: string): string {
  const [, m, d] = value.split('-');
  return `${d}/${m}`;
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: RevenuePoint }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl">
      <div className="text-slate-400">{label}</div>
      <div className="mt-1 font-medium text-slate-100">{formatBRL(p.faturamento)}</div>
      <div className="text-slate-400">
        {p.pedidos} {p.pedidos === 1 ? 'pedido' : 'pedidos'}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-72 items-center justify-center text-sm text-slate-500">
      Sem dados para o período selecionado.
    </div>
  );
}
