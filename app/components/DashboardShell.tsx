'use client';

import { ReactNode } from 'react';
import { DataProvider, useDashboardData } from '../providers/DataProvider';
import { RefreshButton } from './RefreshButton';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from './ThemeToggle';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <SidebarNav />
        <div className="md:pl-64">
          <TopBar />
          <ErrorBanner />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </DataProvider>
  );
}

function TopBar() {
  const { fetchedAt } = useDashboardData();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="ml-12 md:ml-0">
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {fetchedAt
              ? `atualizado em ${new Date(fetchedAt).toLocaleString('pt-BR')}`
              : 'carregando…'}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RefreshButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function ErrorBanner() {
  const { error } = useDashboardData();
  if (!error) return null;
  return (
    <div className="mx-4 mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 sm:mx-6 lg:mx-8">
      Erro ao carregar dados: {error}
    </div>
  );
}
