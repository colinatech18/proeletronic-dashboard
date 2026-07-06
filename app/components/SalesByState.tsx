'use client';

import type { StateRow } from '@/lib/metrics';
import { formatBRL, formatNumber } from '@/lib/metrics';

type Props = {
  data: StateRow[];
  onViewState?: (estado: string) => void;
};

export function SalesByState({ data, onViewState }: Props) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem dados.</div>;
  }

  const max = Math.max(...data.map((d) => d.faturamento));

  return (
    <ul className="space-y-2.5">
      {data.slice(0, 12).map((row) => {
        const width = (row.faturamento / max) * 100;
        return (
          <li key={row.estado}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <span className="inline-flex h-6 w-9 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  {row.estado}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatNumber(row.pedidos)} {row.pedidos === 1 ? 'pedido' : 'pedidos'}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {formatBRL(row.faturamento)}
                </span>
                {onViewState && (
                  <button
                    type="button"
                    onClick={() => onViewState(row.estado)}
                    aria-label={`Ver pedidos de ${row.estado}`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-primary-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-primary-400"
                  >
                    <EyeIcon />
                  </button>
                )}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
