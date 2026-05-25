'use client';

import type { Order } from '@/lib/types';
import { formatBRL, formatDateTime } from '@/lib/metrics';

type Props = { data: Order[] };

const PAID = new Set(['pago', 'paid', 'aprovado', 'approved', 'authorized', 'autorizado']);

export function RecentOrders({ data }: Props) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-500">Sem pedidos.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="px-2 py-2 font-medium">Data</th>
            <th className="px-2 py-2 font-medium">Cliente</th>
            <th className="px-2 py-2 font-medium">Produto</th>
            <th className="px-2 py-2 font-medium">UF</th>
            <th className="px-2 py-2 font-medium">Status</th>
            <th className="px-2 py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((o, i) => (
            <tr
              key={o.orderId || `${i}`}
              className="border-b border-slate-800/60 transition hover:bg-slate-800/40"
            >
              <td className="px-2 py-2.5 text-slate-400">{formatDateTime(o.data)}</td>
              <td className="px-2 py-2.5 text-slate-200">
                <div className="font-medium">{o.nome || '—'}</div>
                <div className="text-xs text-slate-500">{o.email}</div>
              </td>
              <td className="px-2 py-2.5 text-slate-300">
                <span className="line-clamp-1">{o.item || '—'}</span>
              </td>
              <td className="px-2 py-2.5 text-slate-300">{o.estado || '—'}</td>
              <td className="px-2 py-2.5">
                <StatusPill status={o.statusPagamento} />
              </td>
              <td className="px-2 py-2.5 text-right font-medium text-slate-100">
                {formatBRL(o.valorTotal)}
              </td>
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
  const cls = paid
    ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
    : pending
    ? 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
    : 'bg-slate-500/15 text-slate-300 ring-slate-500/30';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {status || '—'}
    </span>
  );
}
