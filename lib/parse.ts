import type { Order } from './types';

const HEADER_MAP: Record<string, keyof Order> = {
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

const NUMERIC_FIELDS = new Set<keyof Order>([
  'quantidadeItens',
  'valorProduto',
  'valorFrete',
  'valorTotal',
]);

export function parseSheetRows(rows: string[][]): Order[] {
  if (!rows || rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const fields = header.map((h) => HEADER_MAP[h] ?? null);

  return rows.slice(1).flatMap((row) => {
    const order = blankOrder();
    let hasAny = false;
    fields.forEach((field, idx) => {
      if (!field) return;
      const raw = row[idx];
      if (raw === undefined || raw === null || raw === '') return;
      hasAny = true;
      if (field === 'data') {
        order.data = parseDate(raw);
      } else if (NUMERIC_FIELDS.has(field)) {
        (order as Record<string, unknown>)[field] = parseNumber(raw);
      } else {
        (order as Record<string, unknown>)[field] = raw.toString().trim();
      }
    });
    return hasAny ? [order] : [];
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

function parseNumber(raw: string): number {
  if (typeof raw === 'number') return raw;
  const cleaned = String(raw)
    .replace(/[R$\s]/gi, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseDate(raw: string): Date | null {
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
