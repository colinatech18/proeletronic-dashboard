import type { Order, Period } from './types';

const PAID_STATUSES = new Set(['pago', 'paid', 'aprovado', 'approved', 'authorized', 'autorizado']);

export function isPaid(order: Order): boolean {
  return PAID_STATUSES.has((order.statusPagamento || '').toLowerCase().trim());
}

export function filterByPeriod(orders: Order[], period: Period): Order[] {
  const { from, to } = resolvePeriod(period);
  if (!from && !to) return orders;
  return orders.filter((o) => {
    if (!o.data) return false;
    if (from && o.data < from) return false;
    if (to && o.data > to) return false;
    return true;
  });
}

export function resolvePeriod(period: Period): { from: Date | null; to: Date | null } {
  if (period.preset === 'all') return { from: null, to: null };
  if (period.preset === 'custom') return { from: period.from, to: period.to };

  const days = period.preset === '7d' ? 7 : period.preset === '30d' ? 30 : 90;
  const to = endOfDay(new Date());
  const from = startOfDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));
  return { from, to };
}

export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

export type Summary = {
  faturamento: number;
  pedidos: number;
  ticketMedio: number;
  taxaAprovacao: number;
};

export function summarize(orders: Order[]): Summary {
  const paid = orders.filter(isPaid);
  const faturamento = paid.reduce((acc, o) => acc + o.valorTotal, 0);
  const pedidos = paid.length;
  const ticketMedio = pedidos > 0 ? faturamento / pedidos : 0;
  const taxaAprovacao = orders.length > 0 ? paid.length / orders.length : 0;
  return { faturamento, pedidos, ticketMedio, taxaAprovacao };
}

export type RevenuePoint = { date: string; faturamento: number; pedidos: number };

export function revenueByDay(orders: Order[]): RevenuePoint[] {
  const map = new Map<string, RevenuePoint>();
  for (const o of orders.filter(isPaid)) {
    if (!o.data) continue;
    const key = isoDate(o.data);
    const cur = map.get(key) ?? { date: key, faturamento: 0, pedidos: 0 };
    cur.faturamento += o.valorTotal;
    cur.pedidos += 1;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export type SourceFunnel = {
  source: string;
  pedidos: number;
  pedidosPagos: number;
  faturamento: number;
};

export function funnelBySource(orders: Order[]): SourceFunnel[] {
  const map = new Map<string, SourceFunnel>();
  for (const o of orders) {
    const source = (o.utmSource || 'direto').toLowerCase();
    const cur = map.get(source) ?? { source, pedidos: 0, pedidosPagos: 0, faturamento: 0 };
    cur.pedidos += 1;
    if (isPaid(o)) {
      cur.pedidosPagos += 1;
      cur.faturamento += o.valorTotal;
    }
    map.set(source, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.pedidos - a.pedidos);
}

export type RevenueShare = { source: string; faturamento: number; share: number };

export function revenueShareBySource(orders: Order[]): RevenueShare[] {
  const map = new Map<string, number>();
  let total = 0;
  for (const o of orders.filter(isPaid)) {
    const source = (o.utmSource || 'direto').toLowerCase();
    map.set(source, (map.get(source) ?? 0) + o.valorTotal);
    total += o.valorTotal;
  }
  return Array.from(map.entries())
    .map(([source, faturamento]) => ({
      source,
      faturamento,
      share: total > 0 ? faturamento / total : 0,
    }))
    .sort((a, b) => b.faturamento - a.faturamento);
}

export type ProductRow = { item: string; quantidade: number; faturamento: number };

export function topProducts(orders: Order[], limit = 10): ProductRow[] {
  const map = new Map<string, ProductRow>();
  for (const o of orders.filter(isPaid)) {
    if (!o.item) continue;
    const cur = map.get(o.item) ?? { item: o.item, quantidade: 0, faturamento: 0 };
    cur.quantidade += o.quantidadeItens || 1;
    cur.faturamento += o.valorTotal;
    map.set(o.item, cur);
  }
  return Array.from(map.values())
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, limit);
}

export type StateRow = { estado: string; pedidos: number; faturamento: number };

export function salesByState(orders: Order[]): StateRow[] {
  const map = new Map<string, StateRow>();
  for (const o of orders.filter(isPaid)) {
    const estado = (o.estado || '—').toUpperCase().trim();
    const cur = map.get(estado) ?? { estado, pedidos: 0, faturamento: 0 };
    cur.pedidos += 1;
    cur.faturamento += o.valorTotal;
    map.set(estado, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.faturamento - a.faturamento);
}

export function recentOrders(orders: Order[], limit = 10): Order[] {
  return [...orders]
    .sort((a, b) => {
      const ad = a.data?.getTime() ?? 0;
      const bd = b.data?.getTime() ?? 0;
      return bd - ad;
    })
    .slice(0, limit);
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(d: Date | null): string {
  if (!d) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d);
}

export function formatDateTime(d: Date | null): string {
  if (!d) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}
