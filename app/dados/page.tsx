'use client';

import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { GlobalFilters } from '../components/GlobalFilters';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { MetricCard } from '../components/MetricCard';
import { OrderModal } from '../components/OrderModal';
import { PageHeader } from '../components/PageHeader';
import { ProductTable } from '../components/ProductTable';
import { SalesByState } from '../components/SalesByState';
import { Tabs } from '../components/Tabs';
import { TopProducts } from '../components/TopProducts';
import { UtmBarChart } from '../components/UtmBarChart';
import { UtmTable } from '../components/UtmTable';
import { useDashboardData } from '../providers/DataProvider';
import {
  customers,
  formatBRL,
  formatNumber,
  funnelBySource,
  isPaid,
  salesByCity,
  salesByState,
  topProducts,
  utmBreakdown,
} from '@/lib/metrics';
import type { CityRow, CustomerRow } from '@/lib/metrics';
import type { Order } from '@/lib/types';

type TabKey = 'produtos' | 'clientes' | 'utms';

const TABS: { value: TabKey; label: string }[] = [
  { value: 'produtos', label: 'Produtos' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'utms', label: 'UTMs' },
];

export default function DadosPage() {
  const { loading } = useDashboardData();
  const [tab, setTab] = useState<TabKey>('produtos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (loading) return <LoadingPlaceholder />;

  return (
    <>
      <PageHeader title="Dados de e-commerce" description="Produtos, clientes e atribuição UTM." />

      <div className="mb-6">
        <GlobalFilters />
      </div>

      <div className="mb-6">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === 'produtos' && <ProdutosTab />}
      {tab === 'clientes' && <ClientesTab onOpenOrder={setSelectedOrder} />}
      {tab === 'utms' && <UtmsTab />}

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

// =============================== PRODUTOS ===============================

function ProdutosTab() {
  const { filteredOrders } = useDashboardData();
  const products = useMemo(() => topProducts(filteredOrders), [filteredOrders]);
  const top10ByRevenue = products.slice(0, 10);
  const top10ByQuantity = useMemo(
    () => [...products].sort((a, b) => b.quantidade - a.quantidade).slice(0, 10),
    [products]
  );
  const paid = useMemo(() => filteredOrders.filter(isPaid), [filteredOrders]);
  const totalItens = paid.reduce((a, o) => a + (o.quantidadeItens || 0), 0);
  const totalReceita = paid.reduce((a, o) => a + o.valorTotal, 0);
  const receitaMediaPorItem = totalItens > 0 ? totalReceita / totalItens : 0;
  const maisVendido = top10ByQuantity[0];

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Itens vendidos" value={formatNumber(totalItens)} accent="primary" />
        <MetricCard
          label="Produto mais vendido"
          value={maisVendido?.item ?? '—'}
          hint={maisVendido ? `${formatNumber(maisVendido.quantidade)} vendas` : ''}
          accent="emerald"
          size="sm"
        />
        <MetricCard
          label="Receita média por item"
          value={formatBRL(receitaMediaPorItem)}
          accent="violet"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Top 10 por receita">
          <TopProducts data={top10ByRevenue} />
        </Card>
        <Card title="Top 10 por quantidade">
          <TopProducts data={top10ByQuantity.map((p) => ({ ...p, faturamento: p.quantidade }))} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="Catálogo completo">
          <ProductTable data={products} orders={filteredOrders} />
        </Card>
      </section>
    </>
  );
}

// =============================== CLIENTES ===============================

function ClientesTab({ onOpenOrder }: { onOpenOrder: (o: Order) => void }) {
  const { filteredOrders } = useDashboardData();
  const allCustomers = useMemo(() => customers(filteredOrders), [filteredOrders]);
  const totalClientes = allCustomers.length;
  const totalGasto = allCustomers.reduce((a, c) => a + c.totalGasto, 0);
  const ticketMedioCliente = totalClientes > 0 ? totalGasto / totalClientes : 0;
  const recorrentes = allCustomers.filter((c) => c.pedidos >= 2).length;
  const topStates = useMemo(() => salesByState(filteredOrders).slice(0, 10), [filteredOrders]);
  const topCities = useMemo(() => salesByCity(filteredOrders).slice(0, 10), [filteredOrders]);

  const customerOrders = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of filteredOrders.filter(isPaid)) {
      const key = (o.email || o.telefone || o.nome || '').toLowerCase().trim();
      if (!key) continue;
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return map;
  }, [filteredOrders]);

  const handleOpen = (customer: CustomerRow) => {
    const list = customerOrders.get(customer.key) ?? [];
    const mostRecent = [...list].sort(
      (a, b) => (b.data?.getTime() ?? 0) - (a.data?.getTime() ?? 0)
    )[0];
    if (mostRecent) onOpenOrder(mostRecent);
  };

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Clientes únicos"
          value={formatNumber(totalClientes)}
          hint="dedup por email/telefone"
          accent="primary"
        />
        <MetricCard
          label="Ticket médio por cliente"
          value={formatBRL(ticketMedioCliente)}
          accent="emerald"
        />
        <MetricCard
          label="Clientes recorrentes"
          value={formatNumber(recorrentes)}
          hint="≥ 2 pedidos pagos"
          accent="violet"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Top 10 estados">
          <SalesByState data={topStates} />
        </Card>
        <Card title="Top 10 cidades">
          <CityList data={topCities} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title={`Clientes (${formatNumber(totalClientes)})`}>
          <CustomerTable data={allCustomers} onOpen={handleOpen} />
        </Card>
      </section>
    </>
  );
}

function CityList({ data }: { data: CityRow[] }) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem dados.</div>;
  }
  const max = Math.max(...data.map((d) => d.faturamento));
  return (
    <ul className="space-y-2.5">
      {data.map((row) => {
        const width = (row.faturamento / max) * 100;
        return (
          <li key={`${row.cidade}-${row.estado}`}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-200">
                {row.cidade}
                <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">/ {row.estado}</span>
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {formatBRL(row.faturamento)}
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

function CustomerTable({
  data,
  onOpen,
}: {
  data: CustomerRow[];
  onOpen: (c: CustomerRow) => void;
}) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem clientes.</div>;
  }
  return (
    <div className="max-h-[640px] overflow-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="sticky top-0 bg-white/95 backdrop-blur dark:bg-slate-800/95">
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="px-2 py-2 font-medium">Nome</th>
            <th className="px-2 py-2 font-medium">Email</th>
            <th className="px-2 py-2 font-medium">Telefone</th>
            <th className="px-2 py-2 font-medium">Cidade / UF</th>
            <th className="px-2 py-2 text-right font-medium">Pedidos</th>
            <th className="px-2 py-2 text-right font-medium">Total gasto</th>
            <th className="px-2 py-2 font-medium" aria-label="Ações"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.key} className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="px-2 py-2.5 text-slate-900 dark:text-slate-100">{c.nome || '—'}</td>
              <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{c.email || '—'}</td>
              <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">{c.telefone || '—'}</td>
              <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400">
                {c.cidade || '—'} / {c.estado || '—'}
              </td>
              <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatNumber(c.pedidos)}</td>
              <td className="px-2 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                {formatBRL(c.totalGasto)}
              </td>
              <td className="px-2 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => onOpen(c)}
                  aria-label="Ver histórico do cliente"
                  title="Ver histórico"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-primary-50 hover:text-primary-600 dark:text-slate-500 dark:hover:bg-primary-500/10 dark:hover:text-primary-300"
                >
                  <EyeIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================== UTMs ===============================

function UtmsTab() {
  const { filteredOrders } = useDashboardData();
  const [selected, setSelected] = useState<string | null>(null);

  const sources = useMemo(() => funnelBySource(filteredOrders), [filteredOrders]);
  const allRows = useMemo(() => utmBreakdown(filteredOrders), [filteredOrders]);
  const drilled = useMemo(
    () => (selected ? allRows.filter((r) => r.source === selected) : allRows),
    [allRows, selected]
  );

  const totalPedidos = sources.reduce((a, s) => a + s.pedidosPagos, 0);
  const totalFaturamento = sources.reduce((a, s) => a + s.faturamento, 0);

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Sources ativas" value={formatNumber(sources.length)} accent="primary" />
        <MetricCard
          label="Pedidos atribuídos"
          value={formatNumber(totalPedidos)}
          accent="violet"
        />
        <MetricCard
          label="Faturamento atribuído"
          value={formatBRL(totalFaturamento)}
          accent="emerald"
        />
      </section>

      <section className="mt-6">
        <Card
          title="Vendas por utm_source"
          action={
            selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-400"
              >
                ← limpar filtro ({selected})
              </button>
            )
          }
        >
          <UtmBarChart
            data={sources}
            selected={selected}
            onSelect={(s) => setSelected((cur) => (cur === s ? null : s))}
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Clique numa barra para filtrar a tabela abaixo.
          </p>
        </Card>
      </section>

      <section className="mt-6">
        <Card title={selected ? `Detalhe — ${selected}` : 'Breakdown completo'}>
          <UtmTable data={drilled} variant="full" />
        </Card>
      </section>
    </>
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
