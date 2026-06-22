'use client';

import { useEffect, useMemo } from 'react';
import { useDashboardData } from '../providers/DataProvider';
import { formatBRL, formatDateTime } from '@/lib/metrics';
import { splitItems } from '@/lib/metrics';
import type { Order } from '@/lib/types';

type Props = {
  order: Order | null;
  onClose: () => void;
};

export function OrderModal({ order, onClose }: Props) {
  const { orders } = useDashboardData();

  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [order, onClose]);

  const history = useMemo(() => {
    if (!order?.email) return [];
    const key = order.email.toLowerCase();
    return orders
      .filter((o) => (o.email || '').toLowerCase() === key)
      .sort((a, b) => (b.data?.getTime() ?? 0) - (a.data?.getTime() ?? 0));
  }, [order, orders]);

  if (!order) return null;

  const products = splitItems(order.item);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pedido {order.orderId || order.pedidoNuvemshop || '—'}
            </div>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-slate-50">
              {formatBRL(order.valorTotal)}
              <span className="ml-2 align-middle">
                <StatusPill status={order.statusPagamento} />
              </span>
            </h2>
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

        <div className="max-h-[calc(90vh-72px)] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Section title="Resumo">
              <Row label="Data" value={formatDateTime(order.data)} />
              <Row label="Order ID" value={order.orderId || '—'} mono />
              <Row label="Pedido Nuvemshop" value={order.pedidoNuvemshop || '—'} mono />
              <Row label="URL" value={order.url || '—'} link={order.url} />
            </Section>

            <Section title="Cliente">
              <Row label="Nome" value={order.nome || '—'} />
              <Row label="Email" value={order.email || '—'} />
              <Row label="Telefone" value={order.telefone || '—'} />
              <Row label="Endereço" value={`${order.cidade || '—'} / ${order.estado || '—'}`} />
              <Row label="CEP" value={order.cep || '—'} />
            </Section>

            <Section title="Produtos" className="md:col-span-2">
              {products.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">—</div>
              ) : (
                <ul className="space-y-1">
                  {products.map((p, i) => (
                    <li
                      key={`${p}-${i}`}
                      className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-700/40"
                    >
                      <span className="text-slate-700 dark:text-slate-200">{p}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatBRL(order.valorTotal / products.length)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <Mini label="Itens" value={String(order.quantidadeItens || 0)} />
                <Mini label="Produto" value={formatBRL(order.valorProduto)} />
                <Mini label="Frete" value={formatBRL(order.valorFrete)} />
              </div>
            </Section>

            <Section title="Pagamento">
              <Row label="Método" value={order.metodoPagamento || '—'} />
              <Row label="Status" value={order.statusPagamento || '—'} />
              <Row label="Tipo de frete" value={order.frete || '—'} />
            </Section>

            <Section title="UTMs">
              <Row label="Source" value={order.utmSource || '—'} />
              <Row label="Campaign" value={order.utmCampaign || '—'} />
              <Row label="Medium" value={order.utmMedium || '—'} />
              <Row label="Content" value={order.utmContent || '—'} />
              <Row label="Term" value={order.utmTerm || '—'} />
              <Row label="Adset" value={order.utmAdset || '—'} />
            </Section>

            <Section title={`Histórico do cliente (${history.length})`} className="md:col-span-2">
              {history.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">Sem histórico.</div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
                  <table className="w-full min-w-[520px] text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-700/40">
                      <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="px-2 py-1.5 font-medium">Data</th>
                        <th className="px-2 py-1.5 font-medium">Produto</th>
                        <th className="px-2 py-1.5 font-medium">Status</th>
                        <th className="px-2 py-1.5 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr
                          key={h.orderId || `${i}`}
                          className={`border-t border-slate-100 dark:border-slate-700/60 ${
                            h.orderId === order.orderId ? 'bg-primary-50/60 dark:bg-primary-500/5' : ''
                          }`}
                        >
                          <td className="px-2 py-1.5 text-slate-500 dark:text-slate-400">
                            {formatDateTime(h.data)}
                          </td>
                          <td className="px-2 py-1.5 text-slate-700 dark:text-slate-200">
                            <span className="line-clamp-1">{h.item || '—'}</span>
                          </td>
                          <td className="px-2 py-1.5">
                            <StatusPill status={h.statusPagamento} compact />
                          </td>
                          <td className="px-2 py-1.5 text-right font-medium text-slate-900 dark:text-slate-100">
                            {formatBRL(h.valorTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
  link,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-right text-primary-600 hover:underline dark:text-primary-300"
        >
          {value}
        </a>
      ) : (
        <span
          className={`truncate text-right text-slate-800 dark:text-slate-100 ${mono ? 'font-mono text-xs' : ''}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-700">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}

const PAID = new Set(['pago', 'paid', 'aprovado', 'approved', 'authorized', 'autorizado']);

function StatusPill({ status, compact = false }: { status: string; compact?: boolean }) {
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
    <span
      className={`inline-flex items-center rounded-full px-2 ${compact ? 'py-0' : 'py-0.5'} text-[10px] font-medium ring-1 ring-inset ${cls}`}
    >
      {status || '—'}
    </span>
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
