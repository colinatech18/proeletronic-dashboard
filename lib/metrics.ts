import type { MetaAdRow, Order, Period } from './types';

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

export function filterMetaByPeriod(rows: MetaAdRow[], period: Period): MetaAdRow[] {
  const { from, to } = resolvePeriod(period);
  if (!from && !to) return rows;
  return rows.filter((r) => {
    if (!r.date) return false;
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });
}

export function resolvePeriod(period: Period): { from: Date | null; to: Date | null } {
  if (period.preset === 'all') return { from: null, to: null };
  if (period.preset === 'custom') return { from: period.from, to: period.to };

  if (period.preset === 'thisMonth') {
    const now = new Date();
    return {
      from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: endOfDay(now),
    };
  }
  if (period.preset === 'lastMonth') {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: startOfDay(first), to: endOfDay(last) };
  }

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

export type PaymentShare = { metodo: string; pedidos: number; share: number };

export function paymentMethodShare(orders: Order[]): PaymentShare[] {
  const map = new Map<string, number>();
  const paid = orders.filter(isPaid);
  for (const o of paid) {
    const m = (o.metodoPagamento || 'desconhecido').toLowerCase();
    map.set(m, (map.get(m) ?? 0) + 1);
  }
  const total = paid.length;
  return Array.from(map.entries())
    .map(([metodo, pedidos]) => ({
      metodo,
      pedidos,
      share: total > 0 ? pedidos / total : 0,
    }))
    .sort((a, b) => b.pedidos - a.pedidos);
}

export type ProductRow = {
  item: string;
  quantidade: number;
  faturamento: number;
  valorMedio: number;
  share: number;
  clientesUnicos: number;
};

export function splitItems(raw: string): string[] {
  return raw.split('|').map((p) => p.trim()).filter(Boolean);
}

export function topProducts(orders: Order[], limit?: number): ProductRow[] {
  const paid = orders.filter(isPaid);
  const totalFaturamento = paid.reduce((acc, o) => acc + o.valorTotal, 0);

  const map = new Map<string, { item: string; quantidade: number; faturamento: number; customerKeys: Set<string> }>();
  for (const o of paid) {
    if (!o.item) continue;
    const products = splitItems(o.item);
    if (products.length === 0) continue;
    const valuePerProduct = o.valorTotal / products.length;
    const customerKey = (o.email || o.telefone || '').toLowerCase().trim();
    for (const product of products) {
      const cur = map.get(product) ?? { item: product, quantidade: 0, faturamento: 0, customerKeys: new Set() };
      cur.quantidade += 1;
      cur.faturamento += valuePerProduct;
      if (customerKey) cur.customerKeys.add(customerKey);
      map.set(product, cur);
    }
  }
  const rows = Array.from(map.values())
    .map((r) => ({
      item: r.item,
      quantidade: r.quantidade,
      faturamento: r.faturamento,
      valorMedio: r.quantidade > 0 ? r.faturamento / r.quantidade : 0,
      share: totalFaturamento > 0 ? r.faturamento / totalFaturamento : 0,
      clientesUnicos: r.customerKeys.size,
    }))
    .sort((a, b) => b.faturamento - a.faturamento);
  return typeof limit === 'number' ? rows.slice(0, limit) : rows;
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

export type CityRow = { cidade: string; estado: string; pedidos: number; faturamento: number };

export function salesByCity(orders: Order[]): CityRow[] {
  const map = new Map<string, CityRow>();
  for (const o of orders.filter(isPaid)) {
    const cidade = (o.cidade || '—').trim();
    const estado = (o.estado || '').toUpperCase().trim();
    const key = `${cidade}__${estado}`;
    const cur = map.get(key) ?? { cidade, estado, pedidos: 0, faturamento: 0 };
    cur.pedidos += 1;
    cur.faturamento += o.valorTotal;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.faturamento - a.faturamento);
}

export type CustomerRow = {
  key: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  pedidos: number;
  totalGasto: number;
};

export function customers(orders: Order[]): CustomerRow[] {
  const map = new Map<string, CustomerRow>();
  for (const o of orders.filter(isPaid)) {
    const key = (o.email || o.telefone || o.nome || '').toLowerCase().trim();
    if (!key) continue;
    const cur =
      map.get(key) ?? {
        key,
        nome: o.nome,
        email: o.email,
        telefone: o.telefone,
        cidade: o.cidade,
        estado: o.estado,
        pedidos: 0,
        totalGasto: 0,
      };
    cur.pedidos += 1;
    cur.totalGasto += o.valorTotal;
    if (!cur.nome && o.nome) cur.nome = o.nome;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.totalGasto - a.totalGasto);
}

export type UtmRow = {
  source: string;
  campaign: string;
  medium: string;
  content: string;
  pedidos: number;
  faturamento: number;
  ticketMedio: number;
};

export function utmBreakdown(orders: Order[]): UtmRow[] {
  const map = new Map<string, UtmRow>();
  for (const o of orders.filter(isPaid)) {
    const source = (o.utmSource || 'direto').toLowerCase();
    const campaign = o.utmCampaign || '—';
    const medium = o.utmMedium || '—';
    const content = o.utmContent || '—';
    const key = `${source}__${campaign}__${medium}__${content}`;
    const cur =
      map.get(key) ?? {
        source,
        campaign,
        medium,
        content,
        pedidos: 0,
        faturamento: 0,
        ticketMedio: 0,
      };
    cur.pedidos += 1;
    cur.faturamento += o.valorTotal;
    map.set(key, cur);
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, ticketMedio: r.pedidos > 0 ? r.faturamento / r.pedidos : 0 }))
    .sort((a, b) => b.faturamento - a.faturamento);
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

export function uniqueValues<T>(items: T[], pick: (item: T) => string | null | undefined): string[] {
  const set = new Set<string>();
  for (const it of items) {
    const v = pick(it);
    if (v) set.add(v);
  }
  return Array.from(set).sort();
}

// ============================== META ADS ==============================

export type MetaSummary = {
  investimento: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  addToCart: number;
  purchase: number;
  receita: number;
  roas: number;
};

export function summarizeMeta(rows: MetaAdRow[]): MetaSummary {
  const investimento = rows.reduce((a, r) => a + r.custo, 0);
  const impressoes = rows.reduce((a, r) => a + r.impressoes, 0);
  const cliques = rows.reduce((a, r) => a + r.cliques, 0);
  const addToCart = rows.reduce((a, r) => a + r.addToCart, 0);
  const purchase = rows.reduce((a, r) => a + r.purchase, 0);
  const receita = rows.reduce((a, r) => a + r.receita, 0);
  return {
    investimento,
    impressoes,
    cliques,
    ctr: impressoes > 0 ? cliques / impressoes : 0,
    cpc: cliques > 0 ? investimento / cliques : 0,
    addToCart,
    purchase,
    receita,
    roas: investimento > 0 ? receita / investimento : 0,
  };
}

export type FunnelStage = { stage: string; value: number };

export function metaFunnel(rows: MetaAdRow[]): FunnelStage[] {
  return [
    { stage: 'view_item', value: rows.reduce((a, r) => a + r.viewItem, 0) },
    { stage: 'add_to_cart', value: rows.reduce((a, r) => a + r.addToCart, 0) },
    { stage: 'view_cart', value: rows.reduce((a, r) => a + r.viewCart, 0) },
    { stage: 'begin_checkout', value: rows.reduce((a, r) => a + r.beginCheckout, 0) },
    { stage: 'add_shipping_info', value: rows.reduce((a, r) => a + r.addShippingInfo, 0) },
    { stage: 'add_payment_info', value: rows.reduce((a, r) => a + r.addPaymentInfo, 0) },
    { stage: 'purchase', value: rows.reduce((a, r) => a + r.purchase, 0) },
  ];
}

export type MetaDayPoint = { date: string; investimento: number; cliques: number };

export function metaInvestmentByDay(rows: MetaAdRow[]): MetaDayPoint[] {
  const map = new Map<string, MetaDayPoint>();
  for (const r of rows) {
    if (!r.date) continue;
    const key = isoDate(r.date);
    const cur = map.get(key) ?? { date: key, investimento: 0, cliques: 0 };
    cur.investimento += r.custo;
    cur.cliques += r.cliques;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export type CampaignRow = {
  campaign: string;
  impressoes: number;
  cliques: number;
  custo: number;
  viewItem: number;
  addToCart: number;
  purchase: number;
  ctr: number;
  cpc: number;
};

export function campaigns(rows: MetaAdRow[]): CampaignRow[] {
  const map = new Map<string, CampaignRow>();
  for (const r of rows) {
    const key = r.campaignName || r.campaignId || '—';
    const cur =
      map.get(key) ?? {
        campaign: key,
        impressoes: 0,
        cliques: 0,
        custo: 0,
        viewItem: 0,
        addToCart: 0,
        purchase: 0,
        ctr: 0,
        cpc: 0,
      };
    cur.impressoes += r.impressoes;
    cur.cliques += r.cliques;
    cur.custo += r.custo;
    cur.viewItem += r.viewItem;
    cur.addToCart += r.addToCart;
    cur.purchase += r.purchase;
    map.set(key, cur);
  }
  return Array.from(map.values())
    .map((c) => ({
      ...c,
      ctr: c.impressoes > 0 ? c.cliques / c.impressoes : 0,
      cpc: c.cliques > 0 ? c.custo / c.cliques : 0,
    }))
    .sort((a, b) => b.custo - a.custo);
}

export type ComparisonRow = {
  date: string;
  metaPurchases: number;
  nuvemshopOrders: number;
};

const META_SOURCE_KEYS = ['facebook', 'meta', 'instagram'];

export function isMetaSource(utmSource: string): boolean {
  const s = (utmSource || '').toLowerCase();
  return META_SOURCE_KEYS.some((k) => s.includes(k));
}

export function metaVsNuvemshop(meta: MetaAdRow[], orders: Order[]): ComparisonRow[] {
  const map = new Map<string, ComparisonRow>();

  for (const m of meta) {
    if (!m.date) continue;
    const key = isoDate(m.date);
    const cur = map.get(key) ?? { date: key, metaPurchases: 0, nuvemshopOrders: 0 };
    cur.metaPurchases += m.purchase;
    map.set(key, cur);
  }

  const metaOrders = orders.filter((o) => isPaid(o) && isMetaSource(o.utmSource));
  for (const o of metaOrders) {
    if (!o.data) continue;
    const key = isoDate(o.data);
    const cur = map.get(key) ?? { date: key, metaPurchases: 0, nuvemshopOrders: 0 };
    cur.nuvemshopOrders += 1;
    map.set(key, cur);
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export type OrdersDayPoint = { date: string; pedidos: number };

export function ordersByDay(orders: Order[]): OrdersDayPoint[] {
  const map = new Map<string, OrdersDayPoint>();
  for (const o of orders.filter(isPaid)) {
    if (!o.data) continue;
    const key = isoDate(o.data);
    const cur = map.get(key) ?? { date: key, pedidos: 0 };
    cur.pedidos += 1;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// ============================== GOOGLE ADS ==============================

const GOOGLE_SOURCE_KEYS = ['google', 'cpc', 'google_ads'];

export function isGoogleSource(utmSource: string): boolean {
  const s = (utmSource || '').toLowerCase();
  return GOOGLE_SOURCE_KEYS.some((k) => s.includes(k));
}

// filterGoogleByPeriod — reutiliza filterMetaByPeriod pois GoogleAdRow = MetaAdRow
export { filterMetaByPeriod as filterGoogleByPeriod };

export function googleVsNuvemshop(google: MetaAdRow[], orders: Order[]): ComparisonRow[] {
  const map = new Map<string, ComparisonRow>();

  for (const g of google) {
    if (!g.date) continue;
    const key = isoDate(g.date);
    const cur = map.get(key) ?? { date: key, metaPurchases: 0, nuvemshopOrders: 0 };
    cur.metaPurchases += g.purchase;
    map.set(key, cur);
  }

  const googleOrders = orders.filter((o) => isPaid(o) && isGoogleSource(o.utmSource));
  for (const o of googleOrders) {
    if (!o.data) continue;
    const key = isoDate(o.data);
    const cur = map.get(key) ?? { date: key, metaPurchases: 0, nuvemshopOrders: 0 };
    cur.nuvemshopOrders += 1;
    map.set(key, cur);
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// ============================== FORMATTERS ==============================

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

// ============================== CAC / ROAS ==============================

// Retorna investimento total Meta (já existe summarizeMeta, use-o)
// Retorna CAC: investimento / pedidos pagos (0 se pedidos = 0)
export function calcCAC(investimento: number, pedidos: number): number {
  return pedidos > 0 ? investimento / pedidos : 0;
}

// Retorna ROAS: faturamento / investimento (0 se investimento = 0)
export function calcROAS(faturamento: number, investimento: number): number {
  return investimento > 0 ? faturamento / investimento : 0;
}

// Taxa de abandono de carrinho via funil de ads: (addToCart - purchase) / addToCart
export function calcCartAbandonmentRate(addToCart: number, purchase: number): number {
  return addToCart > 0 ? (addToCart - purchase) / addToCart : 0;
}

// LTV simples: receita total dos clientes únicos / quantidade de clientes únicos
export function calcLTV(orders: Order[]): number {
  const customerList = customers(orders);
  if (customerList.length === 0) return 0;
  const totalRevenue = customerList.reduce((a, c) => a + c.totalGasto, 0);
  return totalRevenue / customerList.length;
}

// ============================== AGRUPAMENTO ==============================

export type Granularity = 'day' | 'week' | 'month';

// Agrupa RevenuePoint[] por semana (domingo como início) ou mês
export function groupRevenuePoints(points: RevenuePoint[], granularity: Granularity): RevenuePoint[] {
  if (granularity === 'day') return points;

  const map = new Map<string, RevenuePoint>();
  for (const p of points) {
    const d = new Date(p.date + 'T00:00:00');
    let key: string;
    if (granularity === 'week') {
      // Início da semana (domingo)
      const day = d.getDay();
      const diff = d.getDate() - day;
      const start = new Date(d.getFullYear(), d.getMonth(), diff);
      key = isoDateFromParts(start.getFullYear(), start.getMonth() + 1, start.getDate());
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    }
    const cur = map.get(key) ?? { date: key, faturamento: 0, pedidos: 0 };
    cur.faturamento += p.faturamento;
    cur.pedidos += p.pedidos;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function isoDateFromParts(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Agrupa MetaDayPoint[] (investimento por dia) por semana ou mês — mesma chave que groupRevenuePoints
export function groupMetaDayPoints(points: MetaDayPoint[], granularity: Granularity): MetaDayPoint[] {
  if (granularity === 'day') return points;

  const map = new Map<string, MetaDayPoint>();
  for (const p of points) {
    const d = new Date(p.date + 'T00:00:00');
    let key: string;
    if (granularity === 'week') {
      const day = d.getDay();
      const diff = d.getDate() - day;
      const start = new Date(d.getFullYear(), d.getMonth(), diff);
      key = isoDateFromParts(start.getFullYear(), start.getMonth() + 1, start.getDate());
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    }
    const cur = map.get(key) ?? { date: key, investimento: 0, cliques: 0 };
    cur.investimento += p.investimento;
    cur.cliques += p.cliques;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
