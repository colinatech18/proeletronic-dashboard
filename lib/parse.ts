import type { MetaAdRow, Order } from './types';

const ORDER_HEADER_MAP: Record<string, keyof Order> = {
  data: 'data',
  nome: 'nome',
  email: 'email',
  telefone: 'telefone',
  estado: 'estado',
  cidade: 'cidade',
  cep: 'cep',
  item: 'item',
  quantidade_itens: 'quantidadeItens',
  valor_produto: 'valorProduto',
  valor_frete: 'valorFrete',
  valor_total: 'valorTotal',
  frete: 'frete',
  metodo_pagamento: 'metodoPagamento',
  status_pagamento: 'statusPagamento',
  utm_source: 'utmSource',
  utm_campaign: 'utmCampaign',
  utm_medium: 'utmMedium',
  utm_content: 'utmContent',
  utm_term: 'utmTerm',
  utm_adset: 'utmAdset',
  order_id: 'orderId',
  pedido_nuvemshop: 'pedidoNuvemshop',
  url: 'url',
};

const ORDER_NUMERIC = new Set<keyof Order>([
  'quantidadeItens',
  'valorProduto',
  'valorFrete',
  'valorTotal',
]);

const META_HEADER_MAP: Record<string, keyof MetaAdRow> = {
  extraction_date: 'extractionDate',
  date: 'date',
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  campaign_name: 'campaignName',
  campaign_id: 'campaignId',
  adset_name: 'adsetName',
  adset_id: 'adsetId',
  ad_name: 'adName',
  ad_id: 'adId',
  impressoes: 'impressoes',
  cliques: 'cliques',
  custo: 'custo',
  view_item: 'viewItem',
  add_to_cart: 'addToCart',
  view_cart: 'viewCart',
  begin_checkout: 'beginCheckout',
  add_shipping_info: 'addShippingInfo',
  add_payment_info: 'addPaymentInfo',
  purchase: 'purchase',
  receita: 'receita',
};

const META_NUMERIC = new Set<keyof MetaAdRow>([
  'impressoes',
  'cliques',
  'custo',
  'viewItem',
  'addToCart',
  'viewCart',
  'beginCheckout',
  'addShippingInfo',
  'addPaymentInfo',
  'purchase',
  'receita',
]);

const META_DATE = new Set<keyof MetaAdRow>(['extractionDate', 'date']);

export function parseSheetRows(rows: string[][]): Order[] {
  return parseGeneric<Order>(rows, ORDER_HEADER_MAP, ORDER_NUMERIC, new Set(['data']), blankOrder);
}

export function parseMetaRows(rows: string[][]): MetaAdRow[] {
  return parseGeneric<MetaAdRow>(rows, META_HEADER_MAP, META_NUMERIC, META_DATE, blankMeta);
}

function parseGeneric<T>(
  rows: string[][],
  headerMap: Record<string, keyof T>,
  numericFields: Set<keyof T>,
  dateFields: Set<keyof T>,
  blank: () => T
): T[] {
  if (!rows || rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const fields = header.map((h) => headerMap[h] ?? null);

  return rows.slice(1).flatMap((row) => {
    const item = blank();
    let hasAny = false;
    fields.forEach((field, idx) => {
      if (!field) return;
      const raw = row[idx];
      if (raw === undefined || raw === null || raw === '') return;
      hasAny = true;
      if (dateFields.has(field)) {
        (item as Record<string, unknown>)[field as string] = parseDate(raw);
      } else if (numericFields.has(field)) {
        (item as Record<string, unknown>)[field as string] = parseNumber(raw);
      } else {
        (item as Record<string, unknown>)[field as string] = String(raw).trim();
      }
    });
    return hasAny ? [item] : [];
  });
}

function blankOrder(): Order {
  return {
    data: null,
    nome: '',
    email: '',
    telefone: '',
    estado: '',
    cidade: '',
    cep: '',
    item: '',
    quantidadeItens: 0,
    valorProduto: 0,
    valorFrete: 0,
    valorTotal: 0,
    frete: '',
    metodoPagamento: '',
    statusPagamento: '',
    utmSource: '',
    utmCampaign: '',
    utmMedium: '',
    utmContent: '',
    utmTerm: '',
    utmAdset: '',
    orderId: '',
    pedidoNuvemshop: '',
    url: '',
  };
}

function blankMeta(): MetaAdRow {
  return {
    extractionDate: null,
    date: null,
    utmSource: '',
    utmMedium: '',
    campaignName: '',
    campaignId: '',
    adsetName: '',
    adsetId: '',
    adName: '',
    adId: '',
    impressoes: 0,
    cliques: 0,
    custo: 0,
    viewItem: 0,
    addToCart: 0,
    viewCart: 0,
    beginCheckout: 0,
    addShippingInfo: 0,
    addPaymentInfo: 0,
    purchase: 0,
    receita: 0,
  };
}

function parseNumber(raw: string | number): number {
  if (typeof raw === 'number') return raw;
  const cleaned = String(raw)
    .replace(/[R$\s]/gi, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseDate(raw: string | number): Date | null {
  const str = String(raw).trim();
  if (!str) return null;

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (isoMatch) {
    const [, y, m, d, hh = '0', mm = '0', ss = '0'] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
  }

  const brMatch = str.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (brMatch) {
    const [, d, m, y, hh = '0', mm = '0', ss = '0'] = brMatch;
    const year = y.length === 2 ? 2000 + Number(y) : Number(y);
    return new Date(year, Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
  }

  const fallback = new Date(str);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}
