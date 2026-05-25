'use client';

import type { StateRow } from '@/lib/metrics';
import { formatBRL, formatNumber } from '@/lib/metrics';

type Props = { data: StateRow[] };

export function SalesByState({ data }: Props) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-500">Sem dados.</div>;
  }

  const max = Math.max(...data.map((d) => d.faturamento));

  return (
    <ul className="space-y-2.5">
      {data.slice(0, 12).map((row) => {
        const width = (row.faturamento / max) * 100;
        return (
          <li key={row.estado}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-200">
                <span className="inline-flex h-6 w-9 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-slate-300">
                  {row.estado}
                </span>
                <span className="text-xs text-slate-400">
                  {formatNumber(row.pedidos)} {row.pedidos === 1 ? 'pedido' : 'pedidos'}
                </span>
              </span>
              <span className="text-xs font-medium text-slate-200">{formatBRL(row.faturamento)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
