'use client';

import type { ComparisonRow } from '@/lib/metrics';
import { formatNumber } from '@/lib/metrics';

export function ComparisonTable({ data, platformLabel = 'meta' }: { data: ComparisonRow[]; platformLabel?: string }) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem dados para comparar.</div>;
  }
  const totalMeta = data.reduce((a, r) => a + r.metaPurchases, 0);
  const totalNs = data.reduce((a, r) => a + r.nuvemshopOrders, 0);
  const gap = totalMeta - totalNs;

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
        <Pill label="Meta purchases" value={formatNumber(totalMeta)} accent="violet" />
        <Pill label={`Pedidos Nuvemshop (utm=${platformLabel})`} value={formatNumber(totalNs)} accent="primary" />
        <Pill
          label="Divergência"
          value={`${gap > 0 ? '+' : ''}${formatNumber(gap)}`}
          accent={gap === 0 ? 'slate' : gap > 0 ? 'amber' : 'emerald'}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <th className="px-2 py-2 font-medium">Data</th>
              <th className="px-2 py-2 text-right font-medium">Meta (purchase)</th>
              <th className="px-2 py-2 text-right font-medium">Nuvemshop (utm={platformLabel})</th>
              <th className="px-2 py-2 text-right font-medium">Δ</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(-14).reverse().map((r) => {
              const delta = r.metaPurchases - r.nuvemshopOrders;
              return (
                <tr key={r.date} className="border-b border-slate-100 dark:border-slate-800/60">
                  <td className="px-2 py-2 text-slate-500 dark:text-slate-400">{r.date}</td>
                  <td className="px-2 py-2 text-right text-slate-900 dark:text-slate-100">{formatNumber(r.metaPurchases)}</td>
                  <td className="px-2 py-2 text-right text-slate-900 dark:text-slate-100">{formatNumber(r.nuvemshopOrders)}</td>
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      delta === 0
                        ? 'text-slate-400 dark:text-slate-500'
                        : delta > 0
                        ? 'text-amber-600 dark:text-amber-300'
                        : 'text-emerald-600 dark:text-emerald-300'
                    }`}
                  >
                    {delta > 0 ? '+' : ''}
                    {delta}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Pill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'violet' | 'primary' | 'amber' | 'emerald' | 'slate';
}) {
  const cls = {
    violet: 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200',
    primary: 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200',
    amber: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
    slate: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300',
  }[accent];
  return (
    <div className={`rounded-lg border px-3 py-2 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-0.5 text-base font-semibold">{value}</div>
    </div>
  );
}
