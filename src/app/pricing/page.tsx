import { ArrowRight, CheckCircle2, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPricingInquiryMailto } from '@/lib/support';

const plans = [
  {
    name: 'Free Preview',
    price: '$0',
    period: 'no credit card',
    description: 'Run a fast audit preview and see your highest-priority SEO opportunities instantly.',
    features: [
      'Full site crawl (up to 300 pages)',
      'Overall SEO health score',
      'Module grades A–F',
      'Top 5 issues preview',
      'Preview PDF by email',
      'Login to unlock full report',
    ],
    cta: 'Start free audit',
    href: '/',
    popular: false,
    badge: null,
  },
  {
    name: 'DIY Plan',
    price: '$99',
    period: 'one-time',
    description: 'Perfect for developers and in-house teams who want the full fix plan and implementation guidance.',
    features: [
      'Full PDF with all fix guides',
      'All module detail + scoring',
      'Priority matrix and quick wins',
      'AI fix assistant',
      'Developer code recommendations',
      '30-day audit history',
      'Email support',
    ],
    cta: 'Get DIY Plan',
    popular: true,
    badge: 'Most popular',
  },
  {
    name: 'Strategy Plan',
    price: '$129',
    period: 'one-time',
    description: 'For businesses that want expert prioritization and a focused action roadmap after the audit.',
    features: [
      'Everything in DIY Plan',
      'Strategy call booking',
      'Custom action roadmap',
      'Competitor comparison report',
      'Monthly re-audit reminder',
      'Priority email support',
    ],
    cta: 'Get Strategy Plan',
    popular: false,
    badge: null,
  },
  {
    name: 'Full Implementation',
    price: 'Custom',
    period: 'get in touch',
    description: 'Done-for-you implementation for teams that want direct support applying the highest-impact fixes.',
    features: [
      'Everything in Strategy Plan',
      'Done-for-you fix implementation',
      'Direct WhatsApp contact',
      'Implementation planning session',
      'Monthly progress reviews',
    ],
    cta: 'Contact us',
    popular: false,
    badge: null,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right,rgb(255,255,255) 1px,transparent 1px),linear-gradient(to bottom,rgb(255,255,255) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
            Pricing
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Plans for every SEO workflow
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Start with a free audit preview, then upgrade when you need complete fix plans, strategy support, or done-for-you implementation.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
                plan.popular
                  ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/8 to-slate-900 shadow-xl shadow-orange-500/10'
                  : 'border-white/8 bg-slate-900 hover:border-orange-500/20'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                    <Star className="size-2.5" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-xs text-slate-500">/ {plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-orange-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full gap-2 ${
                  plan.popular
                    ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20'
                    : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                <a href={getPricingInquiryMailto(plan.name)}>
                  {plan.cta}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom FAQ strip */}
      <section className="border-t border-white/8 bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            Common questions
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                q: 'Is there a free trial?',
                a: 'Yes — the Free Preview plan lets any guest run a full crawl and see the audit summary at no cost.',
              },
              {
                q: 'Can I upgrade later?',
                a: 'Yes. Start with the free preview and upgrade any time to unlock the full report, fix guides, and strategy tools.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We use Stripe for secure checkout. All major credit and debit cards are accepted.',
              },
              {
                q: 'Do plans auto-renew?',
                a: 'DIY and Strategy plans are one-time purchases. Full Implementation is a custom engagement billed separately.',
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-white/8 bg-slate-800/40 p-4"
              >
                <p className="flex items-start gap-2 text-sm font-semibold">
                  <Zap className="mt-0.5 size-3.5 shrink-0 text-orange-400" />
                  {q}
                </p>
                <p className="mt-1.5 pl-5 text-sm text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
