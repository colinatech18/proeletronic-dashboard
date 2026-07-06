'use client';

import { useMemo, useState } from 'react';
import { Card } from './components/Card';
import { GlobalFilters } from './components/GlobalFilters';
import { LoadingPlaceholder } from './components/LoadingPlaceholder';
import { MetricCard } from './components/MetricCard';
import { OrderModal } from './components/OrderModal';
import { PageHeader } from './components/PageHeader';
import { PaymentMethodPie } from './components/PaymentMethodPie';
import { RecentOrders } from './components/RecentOrders';
import { CombinedChart } from './components/RevenueChart';
import { SalesByState } from './components/SalesByState';
import { TopProducts } from './components/TopProducts';
import { UtmBarChart } from './components/UtmBarChart';
import { UtmTable } from './components/UtmTable';
import { useDashboardData } from './providers/DataProvider';
import {
  calcCAC,
  calcCartAbandonmentRate,
  calcLTV,
  calcROAS,
  formatBRL,
  formatNumber,
  formatPercent,
  funnelBySource,
  metaInvestmentByDay,
  paymentMethodShare,
  recentOrders,
  revenueByDay,
  salesByState,
  summarize,
  summarizeMeta,
  topProducts,
  utmBreakdown,
} from '@/lib/metrics';
import type { Order } from '@/lib/types';

export default function VisaoGeralPage() {
  const { filteredOrders, filteredMeta, filteredGoogleAds, loading } = useDashboardData();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);

  const summary = useMemo(() => summarize(filteredOrders), [filteredOrders]);
  const revenue = useMemo(() => revenueByDay(filteredOrders), [filteredOrders]);
  const metaDayPoints = useMemo(() => metaInvestmentByDay(filteredMeta), [filteredMeta]);
  const payments = useMemo(() => paymentMethodShare(filteredOrders), [filteredOrders]);
  const states = useMemo(() => salesByState(filteredOrders).slice(0, 5), [filteredOrders]);
  const recent = useMemo(() => recentOrders(filteredOrders, 10), [filteredOrders]);
  const utmSources = useMemo(() => funnelBySource(filteredOrders), [filteredOrders]);
  const utmRows = useMemo(() => utmBreakdown(filteredOrders), [filteredOrders]);
  const topProductsData = useMemo(() => topProducts(filteredOrders, 8), [filteredOrders]);

  const metaSummary = useMemo(() => summarizeMeta(filteredMeta), [filteredMeta]);
  const hasMeta = filteredMeta.length > 0;

  const googleSummary = useMemo(() => summarizeMeta(filteredGoogleAds), [filteredGoogleAds]);
  const hasGoogle = filteredGoogleAds.length > 0;

  const investimentoMeta = metaSummary.investimento;
  const investimentoGoogle = googleSummary.investimento;
  const investimentoTotal = investimentoMeta + investimentoGoogle;
  const hasAdsData = hasMeta || hasGoogle;

  const cac = calcCAC(investimentoTotal, summary.pedidos);
  const roas = calcROAS(summary.faturamento, investimentoTotal);

  const totalAddToCart = metaSummary.addToCart + googleSummary.addToCart;
  const totalPurchaseAds = metaSummary.purchase + googleSummary.purchase;
  const taxaAbandono = calcCartAbandonmentRate(totalAddToCart, totalPurchaseAds);
  const ltv = useMemo(() => calcLTV(filteredOrders), [filteredOrders]);

  if (loading) return <LoadingPlaceholder />;

  return (
    <>
      <PageHeader title="Visão geral" description="Resumo das vendas no período selecionado." />

      <div className="mb-6">
        <GlobalFilters />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Faturamento"
          value={formatBRL(summary.faturamento)}
          hint={`${formatNumber(summary.pedidos)} pedidos pagos`}
          accent="emerald"
        />
        <MetricCard
          label="Pedidos"
          value={formatNumber(summary.pedidos)}
          hint="no período selecionado"
          accent="primary"
        />
        <MetricCard
          label="Ticket médio"
          value={formatBRL(summary.ticketMedio)}
          hint="faturamento ÷ pedidos"
          accent="violet"
        />
        <MetricCard
          label="Taxa de aprovação"
          value={formatPercent(summary.taxaAprovacao)}
          hint="pagos ÷ total"
          accent="amber"
        />
        <MetricCard
          label="Investimento Total"
          value={formatBRL(investimentoTotal)}
          hint={hasAdsData
            ? `Meta: ${formatBRL(investimentoMeta)} · Google: ${formatBRL(investimentoGoogle)}`
            : 'sem dados de ads'}
          accent="rose"
        />
        <MetricCard
          label="CAC"
          value={formatBRL(cac)}
          hint={hasAdsData ? 'investimento ÷ pedidos' : 'sem dados de ads'}
          accent="orange"
        />
        <MetricCard
          label="ROAS"
          value={`${roas.toFixed(2)}x`}
          hint={hasAdsData ? 'faturamento ÷ investimento' : 'sem dados de ads'}
          accent="sky"
        />
        <MetricCard
          label="Abandono carrinho"
          value={formatPercent(taxaAbandono)}
          hint={hasAdsData ? 'via funil Meta + Google' : 'sem dados de ads'}
          accent="rose"
        />
        <MetricCard
          label="LTV médio"
          value={formatBRL(ltv)}
          hint="receita ÷ clientes únicos"
          accent="violet"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Faturamento & Pedidos" className="lg:col-span-3">
          <CombinedChart data={revenue} metaData={metaDayPoints} />
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Métodos de pagamento" className="lg:col-span-2">
          <PaymentMethodPie data={payments} />
        </Card>
        <Card title="Top 5 estados">
          <SalesByState data={states} onViewState={setSelectedEstado} />
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Pedidos por utm_source" className="lg:col-span-1">
          <UtmBarChart data={utmSources} />
        </Card>
        <Card title="Source / Campaign" className="lg:col-span-2">
          <UtmTable data={utmRows.slice(0, 8)} variant="compact" orders={filteredOrders} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="Top Produtos">
          <TopProducts data={topProductsData} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="Últimos pedidos">
          <RecentOrders data={recent} onSelect={setSelectedOrder} />
        </Card>
      </section>

      {selectedEstado && (
        <StateOrdersModal
          estado={selectedEstado}
          orders={filteredOrders.filter((o) => o.estado?.toUpperCase().trim() === selectedEstado)}
          onClose={() => setSelectedEstado(null)}
        />
      )}

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

function StateOrdersModal({
  estado,
  orders,
  onClose,
}: {
  estado: string;
  orders: import('@/lib/types').Order[];
  onClose: () => void;
}) {
  const paid = orders.filter((o) => {
    const s = (o.statusPagamento || '').toLowerCase().trim();
    return ['pago', 'paid', 'aprovado', 'approved', 'authorized', 'autorizado'].includes(s);
  });

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
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Pedidos pagos</div>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-50">
              {estado} — {paid.length} {paid.length === 1 ? 'pedido' : 'pedidos'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>
        <div className="max-h-[calc(85vh-72px)] overflow-y-auto p-5">
          {paid.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Nenhum pedido pago neste estado.</div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/40">
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-2 py-2 font-medium">Nome</th>
                    <th className="px-2 py-2 font-medium">Cidade</th>
                    <th className="px-2 py-2 font-medium">Produto</th>
                    <th className="px-2 py-2 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {paid.map((o, i) => (
                    <tr key={o.orderId || `${i}`} className="border-t border-slate-100 dark:border-slate-700/60">
                      <td className="px-2 py-2.5 text-slate-800 dark:text-slate-100">{o.nome || '—'}</td>
                      <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{o.cidade || '—'}</td>
                      <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{o.item || '—'}</td>
                      <td className="px-2 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.valorTotal)}
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
