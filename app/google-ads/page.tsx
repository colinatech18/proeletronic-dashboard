import { Card } from '../components/Card';
import { Funnel } from '../components/Funnel';
import { MetaInvestmentChart } from '../components/MetaInvestmentChart';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';

const EMPTY_FUNNEL = [
  { stage: 'view_item', value: 0 },
  { stage: 'add_to_cart', value: 0 },
  { stage: 'view_cart', value: 0 },
  { stage: 'begin_checkout', value: 0 },
  { stage: 'add_shipping_info', value: 0 },
  { stage: 'add_payment_info', value: 0 },
  { stage: 'purchase', value: 0 },
];

export default function GoogleAdsPage() {
  return (
    <>
      <PageHeader title="Google Ads" description="Performance e funil de Google Ads." />

      <ComingSoonBanner />

      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label="Investimento" value="—" hint="aguardando integração" accent="emerald" />
        <MetricCard label="Impressões" value="—" hint="aguardando integração" accent="primary" />
        <MetricCard label="Cliques" value="—" hint="aguardando integração" accent="violet" />
        <MetricCard label="CTR" value="—" hint="aguardando integração" accent="amber" />
        <MetricCard label="CPC médio" value="—" hint="aguardando integração" accent="sky" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Funil de eventos" className="lg:col-span-1">
          <Funnel data={EMPTY_FUNNEL} />
        </Card>
        <Card title="Investimento por dia" className="lg:col-span-2">
          <MetaInvestmentChart data={[]} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="Campanhas">
          <EmptyTable
            columns={['Campanha', 'Impressões', 'Cliques', 'Custo', 'CTR', 'CPC', 'View item', 'Add cart', 'Purchase']}
          />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="Google vs Nuvemshop (utm_source=google)">
          <EmptyTable columns={['Data', 'Google (purchase)', 'Nuvemshop (utm=google)', 'Δ']} />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="UTMs reais (Nuvemshop)">
          <EmptyTable columns={['Campaign', 'Content', 'Pedidos reais', 'Faturamento real']} />
        </Card>
      </section>
    </>
  );
}

function ComingSoonBanner() {
  return (
    <div className="rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 text-sm dark:border-primary-500/30 dark:bg-primary-500/10">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
        <div>
          <div className="font-semibold text-primary-700 dark:text-primary-200">Em breve</div>
          <div className="text-xs text-primary-700/80 dark:text-primary-200/70">
            Aguardando integração com a aba <code className="rounded bg-primary-100 px-1 dark:bg-primary-500/20">google_ads</code>. A estrutura abaixo está pronta para receber os dados.
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyTable({ columns }: { columns: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {columns.map((c) => (
              <th key={c} className="px-2 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} className="px-2 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Sem dados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
