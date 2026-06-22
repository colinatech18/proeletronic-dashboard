'use client';

import type { SourceFunnel as SourceFunnelData } from '@/lib/metrics';
import { formatNumber, formatPercent } from '@/lib/metrics';

type Props = { data: SourceFunnelData[] };

export function SourceFunnel({ data }: Props) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem dados.</div>;
  }

  const max = Math.max(...data.map((d) => d.pedidos));

  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((row) => {
        const conv = row.pedidos > 0 ? row.pedidosPagos / row.pedidos : 0;
        const totalWidth = (row.pedidos / max) * 100;
        const paidWidth = (row.pedidosPagos / max) * 100;
        return (
          <div key={row.source}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">{row.source}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatNumber(row.pedidosPagos)}/{formatNumber(row.pedidos)} · {formatPercent(conv)}
              </span>
            </div>
            <div className="relative h-7 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
              <div
                className="absolute inset-y-0 left-0 bg-slate-200 dark:bg-slate-600"
                style={{ width: `${totalWidth}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${paidWidth}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
        <Legend color="bg-emerald-500" label="Pagos" />
        <Legend color="bg-slate-300 dark:bg-slate-600" label="Total de pedidos" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-3 rounded ${color}`} />
      {label}
    </span>
  );
}
