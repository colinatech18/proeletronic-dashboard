'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const ITEMS = [
  { href: '/', label: 'Visão geral', icon: HomeIcon },
  { href: '/meta-ads', label: 'Meta Ads', icon: MegaphoneIcon },
  { href: '/google-ads', label: 'Google Ads', icon: SearchIcon },
  { href: '/dados', label: 'Dados de e-commerce', icon: DatabaseIcon },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-600 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 md:hidden"
        aria-label="Abrir menu"
      >
        <MenuIcon />
      </button>

      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white/95 backdrop-blur transition-transform dark:border-slate-700 dark:bg-slate-900/95 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500 text-sm font-bold text-white shadow-md shadow-primary-500/30">
            P
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Proeletronic</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Dashboard</div>
          </div>
        </div>
        <nav className="mt-2 px-2">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? 'bg-primary-500/10 text-primary-700 ring-1 ring-inset ring-primary-500/30 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function iconProps() {
  return {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function HomeIcon() {
  return (
    <svg {...iconProps()}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function DatabaseIcon() {
  return (
    <svg {...iconProps()}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
    </svg>
  );
}
function MegaphoneIcon() {
  return (
    <svg {...iconProps()}>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg {...iconProps()} width={20} height={20}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
