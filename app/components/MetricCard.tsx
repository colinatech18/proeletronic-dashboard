import { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: 'emerald' | 'sky' | 'violet' | 'amber';
};

const ACCENTS: Record<NonNullable<MetricCardProps['accent']>, string> = {
  emerald: 'from-emerald-500/20 to-emerald-500/0 text-emerald-300',
  sky: 'from-sky-500/20 to-sky-500/0 text-sky-300',
  violet: 'from-violet-500/20 to-violet-500/0 text-violet-300',
  amber: 'from-amber-500/20 to-amber-500/0 text-amber-300',
};

export function MetricCard({ label, value, hint, icon, accent = 'sky' }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/20">
      <div className={`absolute inset-0 bg-gradient-to-br ${ACCENTS[accent]} opacity-60`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
          {icon && <span className="text-slate-300">{icon}</span>}
        </div>
        <div className="mt-3 text-3xl font-semibold text-slate-50">{value}</div>
        {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
      </div>
    </div>
  );
}
