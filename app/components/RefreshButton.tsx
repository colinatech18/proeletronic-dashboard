'use client';

import { useDashboardData } from '../providers/DataProvider';

export function RefreshButton() {
  const { loading, refreshing, refresh } = useDashboardData();
  return (
    <button
      type="button"
      onClick={refresh}
      disabled={loading || refreshing}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-primary-400 dark:hover:text-primary-400"
      aria-label="Atualizar dados"
    >
      <RefreshIcon spinning={refreshing} />
      <span>{refreshing ? 'Atualizando…' : 'Atualizar'}</span>
    </button>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? 'animate-spin' : ''}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}
