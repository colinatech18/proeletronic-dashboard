'use client';

import { useMemo } from 'react';
import { Card } from '../components/Card';
import { ComparisonTable } from '../components/ComparisonTable';
import { Funnel } from '../components/Funnel';
import { GlobalFilters } from '../components/GlobalFilters';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { MetaInvestmentChart } from '../components/MetaInvestmentChart';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { useDashboardData } from '../providers/DataProvider';
import {
  campaigns,
  formatBRL,
  formatNumber,
  formatPercent,
  isMetaSource,
  metaFunnel,
  metaInvestmentByDay,
  metaVsNuvemshop,
  summarizeMeta,
  utmBreakdown,
} from '@/lib/metrics';
import type { CampaignRow } from '@/lib/metrics';

export default function MetaAdsPage() {
  const { filteredMeta, filteredOrders, loading } = useDashboardData();

  const summary = useMemo(() => summarizeMeta(filteredMeta), [filteredMeta]);
  const funnel = useMemo(() => metaFunnel(filteredMeta), [filteredMeta]);
  const series = useMemo(() => metaInvestmentByDay(filteredMeta), [filteredMeta]);
  const camps = useMemo(() => campaigns(filteredMeta), [filteredMeta]);
  const comparison = useMemo(
    () => metaVsNuvemshop(filteredMeta, filteredOrders),
    [filteredMeta, filteredOrders]
  );
  const facebookOrders = useMemo(
    () => filteredOrders.filter((o) => isMetaSource(o.utmSource)),
    [filteredOrders]
  );
  const facebookUtms = useMemo(() => utmBreakdown(facebookOrders), [facebookOrders]);

  if (loading) return <LoadingPlaceholder />;

  return (
    <>
      <PageHeader title="Meta Ads" description="Performance, funil de eventos e atribuição real." />

      <div className="mb-6">
        <GlobalFilters hideSourceFilter hideStatusFilter />
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label="Investimento" value={formatBRL(summary.investimento)} accent="emerald" />
        <MetricCard label="Impressões" value={formatNumber(summary.impressoes)} accent="primary" />
        <MetricCard label="Cliques" value={formatNumber(summary.cliques)} accent="violet" />
        <MetricCard label="CTR" value={formatPercent(summary.ctr, 2)} accent="amber" />
        <MetricCard label="CPC médio" value={formatBRL(summary.cpc)} accent="sky" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Funil de eventos" className="lg:col-span-1">
          <Funnel data={funnel} />
        </Card>
        <Card title="Investimento por dia" className="lg:col-span-2">
          <MetaInvestmentChart data={series} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="Campanhas">
          <CampaignsTable data={camps} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="Meta vs Nuvemshop (utm_source=facebook)">
          <ComparisonTable data={comparison} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="UTMs reais (Nuvemshop)" action={<HintTag />}>
          <FacebookUtmTable data={facebookUtms} />
        </Card>
      </section>
    </>
  );
}

function HintTag() {
  return (
    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:bg-slate-700/60 dark:text-slate-400">
      utm_source=facebook
    </span>
  );
}

function CampaignsTable({ data }: { data: CampaignRow[] }) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem campanhas no período.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="px-2 py-2 font-medium">Campanha</th>
            <th className="px-2 py-2 text-right font-medium">Impressões</th>
            <th className="px-2 py-2 text-right font-medium">Cliques</th>
            <th className="px-2 py-2 text-right font-medium">Custo</th>
            <th className="px-2 py-2 text-right font-medium">CTR</th>
            <th className="px-2 py-2 text-right font-medium">CPC</th>
            <th className="px-2 py-2 text-right font-medium">View item</th>
            <th className="px-2 py-2 text-right font-medium">Add cart</th>
            <th className="px-2 py-2 text-right font-medium">Purchase</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.campaign} className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="px-2 py-2.5 text-slate-700 dark:text-slate-200">{c.campaign}</td>
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatNumber(c.impressoes)}</td>
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatNumber(c.cliques)}</td>
              <td className="px-2 py-2.5 text-right text-slate-900 dark:text-slate-100">{formatBRL(c.custo)}</td>
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatPercent(c.ctr, 2)}</td>
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatBRL(c.cpc)}</td>
              <td className="px-2 py-2.5 text-right text-slate-500 dark:text-slate-400">{formatNumber(c.viewItem)}</td>
              <td className="px-2 py-2.5 text-right text-slate-500 dark:text-slate-400">{formatNumber(c.addToCart)}</td>
              <td className="px-2 py-2.5 text-right text-emerald-600 dark:text-emerald-300">{formatNumber(c.purchase)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FacebookUtmTable({ data }: { data: import('@/lib/metrics').UtmRow[] }) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
        Nenhum pedido com utm_source=facebook no período.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="px-2 py-2 font-medium">Campaign</th>
            <th className="px-2 py-2 font-medium">Content</th>
            <th className="px-2 py-2 text-right font-medium">Pedidos reais</th>
            <th className="px-2 py-2 text-right font-medium">Faturamento real</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={`${r.campaign}-${r.content}-${i}`} className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="px-2 py-2.5 text-slate-700 dark:text-slate-200">{r.campaign}</td>
              <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{r.content}</td>
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatNumber(r.pedidos)}</td>
              <td className="px-2 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                {formatBRL(r.faturamento)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
