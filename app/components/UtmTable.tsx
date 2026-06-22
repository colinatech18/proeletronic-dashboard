'use client';

import { useMemo, useState } from 'react';
import type { UtmRow } from '@/lib/metrics';
import { formatBRL, formatDate, formatNumber } from '@/lib/metrics';
import type { Order } from '@/lib/types';

type Variant = 'full' | 'compact';
type SortDir = 'asc' | 'desc';

export function UtmTable({
  data,
  variant = 'full',
  orders,
}: {
  data: UtmRow[];
  variant?: Variant;
  orders?: Order[];
}) {
  const [sortKey, setSortKey] = useState<keyof UtmRow | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<UtmRow | null>(null);

  const showMedium = variant === 'full';
  const showContent = variant === 'full';
  const showTicket = variant === 'full';
  const showOrders = !!orders;

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const handleSort = (key: keyof UtmRow) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const matchedOrders = useMemo(() => {
    if (!selected || !orders) return [];
    return orders.filter(
      (o) =>
        (o.utmSource || 'direto').toLowerCase() === selected.source &&
        (o.utmCampaign || '—') === selected.campaign
    );
  }, [selected, orders]);

  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem dados.</div>;
  }

  const arrow = (key: keyof UtmRow) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <Th onClick={() => handleSort('source')}>Source{arrow('source')}</Th>
            <Th onClick={() => handleSort('campaign')}>Campaign{arrow('campaign')}</Th>
            {showMedium && <Th onClick={() => handleSort('medium')}>Medium{arrow('medium')}</Th>}
            {showContent && <Th onClick={() => handleSort('content')}>Content{arrow('content')}</Th>}
            <Th onClick={() => handleSort('pedidos')} align="right">
              Pedidos{arrow('pedidos')}
            </Th>
            {showTicket && (
              <Th onClick={() => handleSort('ticketMedio')} align="right">
                Ticket médio{arrow('ticketMedio')}
              </Th>
            )}
            <Th onClick={() => handleSort('faturamento')} align="right">
              Faturamento{arrow('faturamento')}
            </Th>
            {showOrders && <th className="px-2 py-2 text-right font-medium" aria-label="Ações" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={`${r.source}-${r.campaign}-${i}`} className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="px-2 py-2.5 text-slate-700 dark:text-slate-200">{r.source}</td>
              <td className="px-2 py-2.5 text-slate-600 dark:text-slate-300">{r.campaign}</td>
              {showMedium && <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{r.medium}</td>}
              {showContent && <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{r.content}</td>}
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatNumber(r.pedidos)}</td>
              {showTicket && (
                <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">
                  {formatBRL(r.ticketMedio)}
                </td>
              )}
              <td className="px-2 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                {formatBRL(r.faturamento)}
              </td>
              {showOrders && (
                <td className="px-2 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-400"
                  >
                    Ver pedidos
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selected && orders && (
        <OrdersModal
          title={`${selected.source} / ${selected.campaign}`}
          orders={matchedOrders}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Th({
  children,
  onClick,
  align = 'left',
}: {
  children: React.ReactNode;
  onClick: () => void;
  align?: 'left' | 'right';
}) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-2 py-2 font-medium hover:text-slate-700 dark:hover:text-slate-200 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

const PAID_STATUSES = new Set(['pago', 'paid', 'aprovado', 'approved', 'authorized', 'autorizado']);

function StatusPill({ status }: { status: string }) {
  const normalized = (status || '').toLowerCase().trim();
  const paid = PAID_STATUSES.has(normalized);
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
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${cls}`}>
      {status || '—'}
    </span>
  );
}

function OrdersModal({
  title,
  orders,
  onClose,
}: {
  title: string;
  orders: Order[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Pedidos</div>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="max-h-[calc(85vh-72px)] overflow-y-auto p-5">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Nenhum pedido encontrado.</div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/40">
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-2 py-2 font-medium">Cliente</th>
                    <th className="px-2 py-2 font-medium">Data</th>
                    <th className="px-2 py-2 text-right font-medium">Valor total</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o.orderId || `${i}`} className="border-t border-slate-100 dark:border-slate-700/60">
                      <td className="px-2 py-2.5 text-slate-800 dark:text-slate-100">{o.nome || '—'}</td>
                      <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{formatDate(o.data)}</td>
                      <td className="px-2 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatBRL(o.valorTotal)}
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusPill status={o.statusPagamento} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
