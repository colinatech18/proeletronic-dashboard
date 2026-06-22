'use client';

import type { Order } from '@/lib/types';
import { formatBRL, formatDateTime } from '@/lib/metrics';

type Props = {
  data: Order[];
  onSelect?: (order: Order) => void;
};

const PAID = new Set(['pago', 'paid', 'aprovado', 'approved', 'authorized', 'autorizado']);

export function RecentOrders({ data, onSelect }: Props) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem pedidos.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="px-2 py-2 font-medium">Data</th>
            <th className="px-2 py-2 font-medium">Cliente</th>
            <th className="px-2 py-2 font-medium">Produto</th>
            <th className="px-2 py-2 font-medium">UF</th>
            <th className="px-2 py-2 font-medium">Status</th>
            <th className="px-2 py-2 text-right font-medium">Total</th>
            {onSelect && <th className="px-2 py-2 font-medium" aria-label="Ações"></th>}
          </tr>
        </thead>
        <tbody>
          {data.map((o, i) => (
            <tr
              key={o.orderId || `${i}`}
              className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-700/30"
            >
              <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{formatDateTime(o.data)}</td>
              <td className="px-2 py-2.5 text-slate-700 dark:text-slate-200">
                <div className="font-medium">{o.nome || '—'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{o.email}</div>
              </td>
              <td className="px-2 py-2.5 text-slate-600 dark:text-slate-300">
                <span className="line-clamp-1">{o.item || '—'}</span>
              </td>
              <td className="px-2 py-2.5 text-slate-600 dark:text-slate-300">{o.estado || '—'}</td>
              <td className="px-2 py-2.5">
                <StatusPill status={o.statusPagamento} />
              </td>
              <td className="px-2 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                {formatBRL(o.valorTotal)}
              </td>
              {onSelect && (
                <td className="px-2 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect(o)}
                    aria-label="Ver detalhes do pedido"
                    title="Ver detalhes"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-primary-50 hover:text-primary-600 dark:text-slate-500 dark:hover:bg-primary-500/10 dark:hover:text-primary-300"
                  >
                    <EyeIcon />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = (status || '').toLowerCase().trim();
  const paid = PAID.has(normalized);
  const pending = ['pendente', 'pending', 'aguardando'].includes(normalized);
  const cancelled = ['cancelado', 'cancelled', 'canceled', 'reembolsado', 'refunded'].includes(normalized);
  const cls = paid
    ? 'bg-emerald-100 text-emerald-700 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30'
    : pending
    ? 'bg-amber-100 text-amber-700 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30'
    : cancelled
    ? 'bg-rose-100 text-rose-700 ring-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30'
    : 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-700/40 dark:text-slate-300 dark:ring-slate-600/40';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {status || '—'}
    </span>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
