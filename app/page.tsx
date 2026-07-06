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
          hint="apenas pagos"
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
          <SalesByState data={states} />
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

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}
