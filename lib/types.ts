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

export type PeriodPreset = '7d' | '30d' | '90d' | 'all' | 'custom';

export type Period = {
  preset: PeriodPreset;
  from: Date | null;
  to: Date | null;
};
