'use client';

import { useMemo, useState } from 'react';
import type { ProductRow } from '@/lib/metrics';
import { formatBRL, formatNumber, isPaid, splitItems } from '@/lib/metrics';
import type { Order } from '@/lib/types';

type SortDir = 'asc' | 'desc';

export function ProductTable({ data, orders }: { data: ProductRow[]; orders?: Order[] }) {
  const [sortKey, setSortKey] = useState<keyof ProductRow | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<ProductRow | null>(null);

  const showCustomers = !!orders;

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

  const handleSort = (key: keyof ProductRow) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const matchedOrders = useMemo(() => {
    if (!selected || !orders) return [];
    return orders.filter((o) => splitItems(o.item).includes(selected.item));
  }, [selected, orders]);

  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem produtos.</div>;
  }

  const arrow = (key: keyof ProductRow) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <Th onClick={() => handleSort('item')}>Produto{arrow('item')}</Th>
            <Th onClick={() => handleSort('quantidade')} align="right">
              Quantidade{arrow('quantidade')}
            </Th>
            <Th onClick={() => handleSort('valorMedio')} align="right">
              Valor médio{arrow('valorMedio')}
            </Th>
            <Th onClick={() => handleSort('faturamento')} align="right">
              Faturamento{arrow('faturamento')}
            </Th>
            {showCustomers && <th className="px-2 py-2 text-right font-medium" aria-label="Ações" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.item} className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="px-2 py-2.5 text-slate-700 dark:text-slate-200">{p.item}</td>
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatNumber(p.quantidade)}</td>
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatBRL(p.valorMedio)}</td>
              <td className="px-2 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">{formatBRL(p.faturamento)}</td>
              {showCustomers && (
                <td className="px-2 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-400"
                  >
                    Ver clientes
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selected && orders && (
        <CustomersModal title={selected.item} orders={matchedOrders} onClose={() => setSelected(null)} />
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

function CustomersModal({
  title,
  orders,
  onClose,
}: {
  title: string;
  orders: Order[];
  onClose: () => void;
}) {
  const paidOrders = useMemo(() => orders.filter(isPaid), [orders]);

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
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Clientes</div>
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
          {paidOrders.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Nenhum cliente encontrado.</div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/40">
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-2 py-2 font-medium">Nome</th>
                    <th className="px-2 py-2 font-medium">Email</th>
                    <th className="px-2 py-2 font-medium">Cidade / UF</th>
                    <th className="px-2 py-2 text-right font-medium">Valor total</th>
                  </tr>
                </thead>
                <tbody>
                  {paidOrders.map((o, i) => (
                    <tr key={o.orderId || `${i}`} className="border-t border-slate-100 dark:border-slate-700/60">
                      <td className="px-2 py-2.5 text-slate-800 dark:text-slate-100">{o.nome || '—'}</td>
                      <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{o.email || '—'}</td>
                      <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">
                        {o.cidade || '—'} / {o.estado || '—'}
                      </td>
                      <td className="px-2 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatBRL(o.valorTotal)}
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
