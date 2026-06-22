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
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20 ${className}`}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}
