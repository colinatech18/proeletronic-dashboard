'use client';

type Tab<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  tabs: Tab<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function Tabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              active
                ? 'bg-primary-500 text-white shadow shadow-primary-500/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
