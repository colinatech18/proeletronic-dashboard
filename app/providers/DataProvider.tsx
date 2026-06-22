'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { filterByPeriod, filterMetaByPeriod } from '@/lib/metrics';
import type { GlobalFilters, MetaAdRow, Order, Period } from '@/lib/types';

type VendasApi = {
  orders?: Array<Omit<Order, 'data'> & { data: string | null }>;
  fetchedAt?: string;
  error?: string;
};

type MetaApi = {
  meta?: Array<Omit<MetaAdRow, 'date' | 'extractionDate'> & {
    date: string | null;
    extractionDate: string | null;
  }>;
  fetchedAt?: string;
  error?: string;
};

type DataContextValue = {
  orders: Order[];
  meta: MetaAdRow[];
  filteredOrders: Order[];
  filteredMeta: MetaAdRow[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchedAt: string | null;
  filters: GlobalFilters;
  setPeriod: (p: Period) => void;
  setUtmSource: (s: string | null) => void;
  setStatusPagamento: (s: string | null) => void;
  refresh: () => void;
};

const DataContext = createContext<DataContextValue | null>(null);

const DEFAULT_FILTERS: GlobalFilters = {
  period: { preset: '30d', from: null, to: null },
  utmSource: null,
  statusPagamento: null,
};

const AUTO_REFRESH_MS = 5 * 60 * 1000;

export function DataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<MetaAdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [vRes, mRes] = await Promise.all([
        fetch('/api/sheets/vendas', { cache: 'no-store' }),
        fetch('/api/sheets/meta', { cache: 'no-store' }),
      ]);
      const vendasData = (await vRes.json()) as VendasApi;
      const metaData = (await mRes.json()) as MetaApi;

      const errors = [vendasData.error, metaData.error].filter(Boolean);
      if (errors.length === 2) {
        setError(errors.join(' · '));
        return;
      }

      if (vendasData.orders) {
        setOrders(
          vendasData.orders.map((o) => ({ ...o, data: o.data ? new Date(o.data) : null }))
        );
      }
      if (metaData.meta) {
        setMeta(
          metaData.meta.map((m) => ({
            ...m,
            date: m.date ? new Date(m.date) : null,
            extractionDate: m.extractionDate ? new Date(m.extractionDate) : null,
          }))
        );
      }
      setFetchedAt(vendasData.fetchedAt ?? metaData.fetchedAt ?? new Date().toISOString());
      setError(errors[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const filteredOrders = useMemo(() => {
    let res = filterByPeriod(orders, filters.period);
    if (filters.utmSource) {
      const u = filters.utmSource.toLowerCase();
      res = res.filter((o) => (o.utmSource || 'direto').toLowerCase() === u);
    }
    if (filters.statusPagamento) {
      const s = filters.statusPagamento.toLowerCase();
      res = res.filter((o) => (o.statusPagamento || '').toLowerCase() === s);
    }
    return res;
  }, [orders, filters]);

  const filteredMeta = useMemo(() => {
    let res = filterMetaByPeriod(meta, filters.period);
    if (filters.utmSource) {
      const u = filters.utmSource.toLowerCase();
      res = res.filter((r) => (r.utmSource || '').toLowerCase() === u);
    }
    return res;
  }, [meta, filters]);

  const value: DataContextValue = {
    orders,
    meta,
    filteredOrders,
    filteredMeta,
    loading,
    refreshing,
    error,
    fetchedAt,
    filters,
    setPeriod: (period) => setFilters((f) => ({ ...f, period })),
    setUtmSource: (utmSource) => setFilters((f) => ({ ...f, utmSource })),
    setStatusPagamento: (statusPagamento) => setFilters((f) => ({ ...f, statusPagamento })),
    refresh: () => load({ silent: true }),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDashboardData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDashboardData must be used inside DataProvider');
  return ctx;
}
