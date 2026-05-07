import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Shield, Sparkles, Zap, Globe, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'All In One SEO Audit Tool — Free Technical, CRO, Local and AI SEO Check in 60 Seconds',
  description:
    'Run a free all-in-one SEO audit covering Technical SEO, Core Web Vitals, CRO, Local SEO, AI Visibility, and Schema. Get your complete score with a downloadable PDF report instantly.',
  keywords: [
    'all in one SEO audit tool',
    'SEO audit',
    'technical SEO audit',
    'CRO audit',
    'local SEO audit',
    'AI SEO audit',
    'schema audit',
    'free SEO report',
  ],
};

export default function AboutPage() {
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

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
            <Sparkles className="mr-1.5 size-3" />
            About Dexora Digital
          </span>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                The founder-led SEO platform built for growth-focused teams.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                Built after years of running campaigns for ambitious brands in the USA, UK, and Australia — this audit platform combines agency-grade SEO process with a fast, modern product experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20"
                >
                  <Link href="/">
                    Run a free audit
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href="/contact">Talk to our team</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  { label: '5+ years', value: 'SEO experience' },
                  { label: '100+', value: 'businesses helped' },
                  { label: '3 markets', value: 'USA · UK · Australia' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/8 bg-slate-900 p-5 text-center"
                  >
                    <p className="text-2xl font-bold text-orange-400">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Founder card */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Founder</p>
                  <h2 className="text-xl font-semibold">Taqweem Ahmad</h2>
                </div>
                <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">
                  <Sparkles className="size-5" />
                </div>
              </div>
              <div className="relative h-100 w-full overflow-hidden">
                <Image
                  src="https://dexoradigital.com/wp-content/uploads/2026/01/Dexora-Team.png"
                  alt="Taqweem Ahmad – Founder of Dexora Digital"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                />
              </div>
              <div className="p-5">
                <p className="text-sm leading-relaxed text-slate-400">
                  I turned agency experience into a performance-first SEO platform that helps teams discover hidden issues and prioritize fast wins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">What drives us</p>
          <h2 className="mt-2 text-3xl font-bold">Built for modern SEO workflows</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-slate-400">
            Every part of this platform follows the same process: clear results, practical recommendations, and a fast path to action.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Zap className="size-5" />,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              title: 'Real audit cadence',
              desc: 'This platform showcases audit-first thinking that powers every report and recommendation we ship.',
            },
            {
              icon: <Shield className="size-5" />,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              title: 'Trustworthy process',
              desc: 'Every insight is rooted in proven SEO strategy — not generic marketing claims.',
            },
            {
              icon: <TrendingUp className="size-5" />,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              title: 'Actionable clarity',
              desc: 'We focus on the few changes that deliver the biggest traffic and technical wins.',
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

      {/* Why I built this */}
      <section className="border-t border-white/8 bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                Founder story
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight">Why I built this tool</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
                After working with dozens of brands, I kept seeing the same problem: high-quality SEO insights were locked behind complex dashboards or expensive retainers. This platform makes those insights simple, fast, and directly usable by any team.
              </p>
              <div className="mt-8 flex gap-6">
                {[
                  { icon: <Globe className="size-4" />, label: 'Global reach' },
                  { icon: <Award className="size-4" />, label: 'Agency grade' },
                  { icon: <TrendingUp className="size-4" />, label: 'ROI focused' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5 text-slate-400">
                    <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">{item.icon}</div>
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                'Built for busy founders and marketing teams',
                'Designed around audits that lead to action',
                'Focused on measurable traffic and revenue outcomes',
                'Transparent scoring with no black-box metrics',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-slate-800/60 px-4 py-3.5 text-sm text-slate-300"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-orange-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
