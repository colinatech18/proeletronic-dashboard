import { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: 'primary' | 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'orange';
  size?: 'default' | 'sm';
};

const ACCENTS: Record<NonNullable<MetricCardProps['accent']>, string> = {
  primary: 'from-primary-500/15 to-primary-500/0 text-primary-600 dark:text-primary-300',
  emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-300',
  sky: 'from-sky-500/15 to-sky-500/0 text-sky-600 dark:text-sky-300',
  violet: 'from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-300',
  amber: 'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-300',
  rose: 'from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-300',
  orange: 'from-orange-500/15 to-orange-500/0 text-orange-600 dark:text-orange-300',
};

export function MetricCard({
  label,
  value,
  hint,
  icon,
  accent = 'primary',
  size = 'default',
}: MetricCardProps) {
  const valueClass =
    size === 'sm'
      ? 'mt-3 text-base font-semibold leading-tight text-slate-900 line-clamp-2 dark:text-slate-50'
      : 'mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-50';

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20">
      <div className={`absolute inset-0 bg-gradient-to-br ${ACCENTS[accent]} opacity-70`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
          {icon}
        </div>
        <div className={valueClass}>{value}</div>
        {hint && (
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>
        )}
      </div>
    </div>
  );
}
