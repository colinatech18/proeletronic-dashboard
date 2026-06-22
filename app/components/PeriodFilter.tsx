'use client';

import type { Period, PeriodPreset } from '@/lib/types';

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: 'all', label: 'Tudo' },
  { value: 'custom', label: 'Personalizado' },
];

type Props = {
  period: Period;
  onChange: (period: Period) => void;
};

export function PeriodFilter({ period, onChange }: Props) {
  const handlePreset = (preset: PeriodPreset) => {
    if (preset === 'custom') {
      onChange({ ...period, preset });
    } else {
      onChange({ preset, from: null, to: null });
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
        {PRESETS.map((p) => {
          const active = period.preset === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => handlePreset(p.value)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                active
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {period.preset === 'custom' && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5">
          <DateInput
            label="De"
            value={period.from}
            onChange={(d) => onChange({ ...period, from: d })}
          />
          <span className="text-slate-500">→</span>
          <DateInput
            label="Até"
            value={period.to}
            onChange={(d) => onChange({ ...period, to: d })}
          />
        </div>
      )}
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-slate-400">
      <span>{label}</span>
      <input
        type="date"
        value={value ? toInputValue(value) : ''}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
        className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
      />
    </label>
  );
}

function toInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
