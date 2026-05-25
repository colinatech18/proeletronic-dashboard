'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from './components/Card';
import { ChannelDistribution } from './components/ChannelDistribution';
import { MetricCard } from './components/MetricCard';
import { PeriodFilter } from './components/PeriodFilter';
import { RecentOrders } from './components/RecentOrders';
import { RevenueChart } from './components/RevenueChart';
import { SalesByState } from './components/SalesByState';
import { SourceFunnel } from './components/SourceFunnel';
import { TopProducts } from './components/TopProducts';
import {
  filterByPeriod,
  formatBRL,
  formatNumber,
  formatPercent,
  funnelBySource,
  recentOrders,
  revenueByDay,
  revenueShareBySource,
  salesByState,
  summarize,
  topProducts,
} from '@/lib/metrics';
import type { Order, Period } from '@/lib/types';

type ApiResponse = {
  orders?: Array<Omit<Order, 'data'> & { data: string | null }>;
  fetchedAt?: string;
  error?: string;
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>({ preset: '30d', from: null, to: null });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/sheets')
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          return;
        }
        const parsed: Order[] = (data.orders ?? []).map((o) => ({
          ...o,
          data: o.data ? new Date(o.data) : null,
        }));
        setOrders(parsed);
        setFetchedAt(data.fetchedAt ?? null);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err.message ?? 'Erro desconhecido'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => filterByPeriod(orders, period), [orders, period]);
  const summary = useMemo(() => summarize(filtered), [filtered]);
  const revenueSeries = useMemo(() => revenueByDay(filtered), [filtered]);
  const funnel = useMemo(() => funnelBySource(filtered), [filtered]);
  const channelShare = useMemo(() => revenueShareBySource(filtered), [filtered]);
  const products = useMemo(() => topProducts(filtered, 10), [filtered]);
  const states = useMemo(() => salesByState(filtered), [filtered]);
  const recent = useMemo(() => recentOrders(filtered, 10), [filtered]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Dashboard Proeletronic
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Visão geral das vendas integradas via Google Sheets.
            {fetchedAt && (
              <span className="ml-2 text-slate-500">
                · atualizado em {new Date(fetchedAt).toLocaleString('pt-BR')}
              </span>
            )}
          </p>
        </div>
        <PeriodFilter period={period} onChange={setPeriod} />
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Erro ao carregar dados: {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
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
              hint="apenas pedidos pagos"
              accent="sky"
            />
            <MetricCard
              label="Ticket médio"
              value={formatBRL(summary.ticketMedio)}
              hint="faturamento ÷ pedidos pagos"
              accent="violet"
            />
            <MetricCard
              label="Taxa de aprovação"
              value={formatPercent(summary.taxaAprovacao)}
              hint="pagos ÷ total no período"
              accent="amber"
            />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card title="Faturamento ao longo do tempo" className="lg:col-span-2">
              <RevenueChart data={revenueSeries} />
            </Card>
            <Card title="Distribuição por canal">
              <ChannelDistribution data={channelShare} />
            </Card>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card title="Funil por UTM source" className="lg:col-span-2">
              <SourceFunnel data={funnel} />
            </Card>
            <Card title="Vendas por estado">
              <SalesByState data={states} />
            </Card>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card title="Top 10 produtos" className="lg:col-span-2">
              <TopProducts data={products} />
            </Card>
            <Card title="Últimos pedidos" className="lg:col-span-3">
              <RecentOrders data={recent} />
            </Card>
          </section>
        </>
      )}
    </main>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60 lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
      </div>
    </div>
  );
}
