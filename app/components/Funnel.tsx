'use client';

import type { FunnelStage } from '@/lib/metrics';
import { formatNumber, formatPercent } from '@/lib/metrics';

export function Funnel({ data }: { data: FunnelStage[] }) {
  if (data.length === 0 || data[0].value === 0) {
    return <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sem eventos no período.</div>;
  }
  const top = data[0].value;
  return (
    <ul className="space-y-2">
      {data.map((stage, i) => {
        const fromTop = top > 0 ? stage.value / top : 0;
        const fromPrev = i > 0 && data[i - 1].value > 0 ? stage.value / data[i - 1].value : 1;
        return (
          <li key={stage.stage}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">{stage.stage}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatNumber(stage.value)}
                {i > 0 && (
                  <span className="ml-2 text-slate-400 dark:text-slate-500">
                    {formatPercent(fromPrev)} do anterior
                  </span>
                )}
              </span>
            </div>
            <div className="h-7 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-violet-500"
                style={{ width: `${Math.max(fromTop * 100, 1)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
