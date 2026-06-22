export type Order = {
  data: Date | null;
  nome: string;
  email: string;
  telefone: string;
  estado: string;
  cidade: string;
  cep: string;
  item: string;
  quantidadeItens: number;
  valorProduto: number;
  valorFrete: number;
  valorTotal: number;
  frete: string;
  metodoPagamento: string;
  statusPagamento: string;
  utmSource: string;
  utmCampaign: string;
  utmMedium: string;
  utmContent: string;
  utmTerm: string;
  utmAdset: string;
  orderId: string;
  pedidoNuvemshop: string;
  url: string;
};

export type MetaAdRow = {
  extractionDate: Date | null;
  date: Date | null;
  utmSource: string;
  utmMedium: string;
  campaignName: string;
  campaignId: string;
  adsetName: string;
  adsetId: string;
  adName: string;
  adId: string;
  impressoes: number;
  cliques: number;
  custo: number;
  viewItem: number;
  addToCart: number;
  viewCart: number;
  beginCheckout: number;
  addShippingInfo: number;
  addPaymentInfo: number;
  purchase: number;
  receita: number;
};

export type PeriodPreset =
  | '7d'
  | '30d'
  | '90d'
  | 'thisMonth'
  | 'lastMonth'
  | 'all'
  | 'custom';

export type Period = {
  preset: PeriodPreset;
  from: Date | null;
  to: Date | null;
};

export type GlobalFilters = {
  period: Period;
  utmSource: string | null;
  statusPagamento: string | null;
};
