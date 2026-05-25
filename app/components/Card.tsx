import { ReactNode } from 'react';

type CardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/20 backdrop-blur ${className}`}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
