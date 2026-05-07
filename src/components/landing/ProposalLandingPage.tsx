import Link from 'next/link';
import { ArrowRight, CheckCircle2, Search, Shield, Zap, Sparkles, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProposalLandingPageProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  focusChecks: string[];
  ctaLabel: string;
}

export function ProposalLandingPage({
  eyebrow,
  title,
  description,
  bullets,
  focusChecks,
  ctaLabel,
}: ProposalLandingPageProps) {
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

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
            <Sparkles className="mr-1.5 size-3" />
            {eyebrow}
          </span>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">{description}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20"
                >
                  <Link href="/">
                    <Search className="size-4" />
                    {ctaLabel}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href="/features">
                    View all features
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-orange-400" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Focus checks card */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                What this module checks
              </p>
              <div className="space-y-2.5">
                {focusChecks.map((check, i) => (
                  <div
                    key={check}
                    className="flex items-start gap-3 rounded-lg border border-white/5 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-300"
                  >
                    <span className="mt-px shrink-0 text-xs font-bold text-orange-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {check}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">How it works</p>
          <h2 className="mt-2 text-3xl font-bold">Powered by a live audit engine</h2>
          <p className="mt-3 text-sm text-slate-400">
            Every module connects into the same crawl and scoring pipeline used across the full platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Search className="size-5" />,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              title: 'Live crawl',
              desc: 'Audits run against the current state of your site — not cached or pre-scored data.',
            },
            {
              icon: <Zap className="size-5" />,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              title: 'Performance intelligence',
              desc: 'PageSpeed and Lighthouse-backed metrics with runtime fallbacks for every device type.',
            },
            {
              icon: <BarChart3 className="size-5" />,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              title: 'Actionable scoring',
              desc: 'Issues are ranked by impact and effort so you fix the right things first.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/8 bg-slate-900 p-5 transition-all hover:-translate-y-0.5 hover:border-orange-500/20"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="mb-1.5 font-semibold">{card.title}</h3>
              <p className="text-sm text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-white/8 bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6">
          <p className="text-2xl font-bold">Ready to run your audit?</p>
          <p className="max-w-md text-sm text-slate-400">
            Full site coverage across 7 SEO modules in under 60 seconds. Free preview, no card required.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-1 gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/25"
          >
            <Link href="/">
              <Search className="size-4" />
              {ctaLabel}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
