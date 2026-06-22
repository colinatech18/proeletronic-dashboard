'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Granularity, MetaDayPoint, RevenuePoint } from '@/lib/metrics';
import {
  calcCAC,
  calcROAS,
  formatBRL,
  formatNumber,
  groupMetaDayPoints,
  groupRevenuePoints,
} from '@/lib/metrics';

type ExtraMetric = 'none' | 'investimento' | 'cac' | 'roas';

type Props = {
  data: RevenuePoint[];
  metaData?: MetaDayPoint[];
  totalInvestimento?: number;
  totalPedidos?: number;
};

type ChartPoint = RevenuePoint & { investimento: number; extra: number | null };

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
];

const EXTRA_OPTIONS: { value: ExtraMetric; label: string }[] = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'investimento', label: 'Investimento' },
  { value: 'cac', label: 'CAC' },
  { value: 'roas', label: 'ROAS' },
];

const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function CombinedChart({ data, metaData }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [extraMetric, setExtraMetric] = useState<ExtraMetric>('none');

  const points = useMemo<ChartPoint[]>(() => {
    const grouped = groupRevenuePoints(data, granularity);

    const investByDate = new Map<string, number>();
    if (extraMetric !== 'none' && metaData && metaData.length > 0) {
      for (const m of groupMetaDayPoints(metaData, granularity)) {
        investByDate.set(m.date, (investByDate.get(m.date) ?? 0) + m.investimento);
      }
    }

    return grouped.map((p) => {
      const investimento = investByDate.get(p.date) ?? 0;
      let extra: number | null = null;
      if (extraMetric === 'investimento') extra = investimento;
      else if (extraMetric === 'cac') extra = calcCAC(investimento, p.pedidos);
      else if (extraMetric === 'roas') extra = calcROAS(p.faturamento, investimento);
      return { ...p, investimento, extra };
    });
  }, [data, metaData, granularity, extraMetric]);

  const hasExtra = extraMetric !== 'none';
  const extraLabel = EXTRA_OPTIONS.find((o) => o.value === extraMetric)?.label ?? '';

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {GRANULARITIES.map((g) => {
            const active = granularity === g.value;
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => setGranularity(g.value)}
                className={`rounded-lg px-3 py-1 text-xs transition ${
                  active
                    ? 'bg-primary-500 text-white shadow shadow-primary-500/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        <select
          value={extraMetric}
          onChange={(e) => setExtraMetric(e.target.value as ExtraMetric)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {EXTRA_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900">
              {o.value === 'none' ? 'Métrica extra' : o.label}
            </option>
          ))}
        </select>
      </div>

      {points.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="date"
                stroke="var(--chart-axis)"
                fontSize={12}
                tickFormatter={(v) => formatTick(v, granularity)}
              />
              <YAxis
                yAxisId="orders"
                stroke="var(--chart-axis)"
                fontSize={12}
                allowDecimals={false}
                tickFormatter={(v) => formatNumber(Number(v))}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                stroke="var(--chart-axis)"
                fontSize={12}
                tickFormatter={(v) => formatBRL(Number(v)).replace('R$', '').trim()}
              />
              <Tooltip content={<CombinedTooltip granularity={granularity} extra={extraMetric} extraLabel={extraLabel} />} />
              <Bar yAxisId="orders" dataKey="pedidos" fill="#00C9B1" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="pedidos"
                  position="top"
                  fontSize={10}
                  fill="var(--chart-axis-strong)"
                  formatter={(v) => formatNumber(Number(v))}
                />
              </Bar>
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="faturamento"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              >
                <LabelList
                  dataKey="faturamento"
                  position="top"
                  fontSize={10}
                  fill="#f59e0b"
                  formatter={(v) => formatBRL(Number(v)).replace('R$', '').trim()}
                />
              </Line>
              {hasExtra && (
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="extra"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function formatTick(value: string, granularity: Granularity): string {
  const [y, m, d] = value.split('-');
  if (granularity === 'month') {
    const idx = Number(m) - 1;
    const abbr = MONTHS_PT[idx] ?? m;
    return `${abbr}/${y.slice(2)}`;
  }
  return `${d}/${m}`;
}

function formatExtraValue(extra: ExtraMetric, value: number): string {
  if (extra === 'roas') return `${value.toFixed(2)}x`;
  return formatBRL(value);
}

function CombinedTooltip({
  active,
  payload,
  granularity,
  extra,
  extraLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  granularity: Granularity;
  extra: ExtraMetric;
  extraLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
      <div className="text-slate-500 dark:text-slate-400">{formatTick(p.date, granularity)}</div>
      <div className="mt-1 font-medium text-amber-600 dark:text-amber-400">
        {formatBRL(p.faturamento)}
      </div>
      <div className="text-slate-600 dark:text-slate-300">
        {formatNumber(p.pedidos)} {p.pedidos === 1 ? 'pedido' : 'pedidos'}
      </div>
      {extra !== 'none' && p.extra !== null && (
        <div className="text-indigo-500 dark:text-indigo-300">
          {extraLabel}: {formatExtraValue(extra, p.extra)}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-72 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
      Sem dados para o período selecionado.
    </div>
  );
}
