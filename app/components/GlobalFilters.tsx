'use client';

import { useMemo } from 'react';
import { useDashboardData } from '../providers/DataProvider';
import { uniqueValues } from '@/lib/metrics';
import type { PeriodPreset } from '@/lib/types';

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês anterior' },
  { value: 'all', label: 'Tudo' },
  { value: 'custom', label: 'Personalizado' },
];

type GlobalFiltersProps = {
  hideSourceFilter?: boolean;
  hideStatusFilter?: boolean;
};

export function GlobalFilters({ hideSourceFilter = false, hideStatusFilter = false }: GlobalFiltersProps) {
  const { filters, setPeriod, setUtmSource, setStatusPagamento, orders } = useDashboardData();

  const sources = useMemo(
    () => uniqueValues(orders, (o) => o.utmSource || 'direto'),
    [orders]
  );
  const statuses = useMemo(
    () => uniqueValues(orders, (o) => o.statusPagamento || null),
    [orders]
  );

  const handlePreset = (preset: PeriodPreset) => {
    if (preset === 'custom') {
      setPeriod({ ...filters.period, preset });
    } else {
      setPeriod({ preset, from: null, to: null });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
        {PRESETS.map((p) => {
          const active = filters.period.preset === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => handlePreset(p.value)}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                active
                  ? 'bg-primary-500 text-white shadow shadow-primary-500/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {filters.period.preset === 'custom' && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-800">
          <DateInput
            value={filters.period.from}
            onChange={(d) => setPeriod({ ...filters.period, from: d })}
          />
          <span className="text-slate-400 dark:text-slate-500">→</span>
          <DateInput
            value={filters.period.to}
            onChange={(d) => setPeriod({ ...filters.period, to: d })}
          />
        </div>
      )}

      {!hideSourceFilter && (
        <Select
          value={filters.utmSource ?? ''}
          onChange={(v) => setUtmSource(v || null)}
          options={[{ value: '', label: 'Todas sources' }, ...sources.map((s) => ({ value: s, label: s }))]}
        />
      )}
      {!hideStatusFilter && (
        <Select
          value={filters.statusPagamento ?? ''}
          onChange={(v) => setStatusPagamento(v || null)}
          options={[
            { value: '', label: 'Todos status' },
            ...statuses.map((s) => ({ value: s, label: s })),
          ]}
        />
      )}
    </div>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (d: Date | null) => void;
}) {
  return (
    <input
      type="date"
      value={value ? toInputValue(value) : ''}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function toInputValue(d: Date | null): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
