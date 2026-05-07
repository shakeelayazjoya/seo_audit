import Link from 'next/link';
import { ArrowRight, Shield, Zap, FileText, Users, Globe, Sparkles, BarChart3, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const modules = [
  {
    icon: <Shield className="size-5" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Technical SEO',
    desc: 'SSL, sitemaps, robots.txt, canonical tags, crawl depth, HTTP status health, and 40+ technical checks to ensure search engines can find and index your site.',
    points: ['Canonical & noindex checks', 'Sitemap and llms.txt discovery', 'Duplicate metadata detection', 'Crawl depth analysis'],
  },
  {
    icon: <Zap className="size-5" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'Core Web Vitals & Performance',
    desc: 'LCP, INP, and CLS metrics powered by Google PageSpeed Insights integration with mobile/desktop split reporting.',
    points: ['PageSpeed & Lighthouse integration', 'Mobile vs desktop split', 'Performance grading A–F', 'Provider notes for confidence'],
  },
  {
    icon: <FileText className="size-5" />,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    title: 'On-Page & Content',
    desc: 'Title tags, meta descriptions, heading hierarchy, keyword usage, duplicate content detection, and image attribute analysis.',
    points: ['Title & meta quality scoring', 'Heading structure analysis', 'Image alt text checks', 'Duplicate content signals'],
  },
  {
    icon: <Users className="size-5" />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    title: 'CRO Analysis',
    desc: 'CTA detection, form friction scoring, trust signals, contact accessibility, and above-the-fold action analysis to turn organic traffic into conversions.',
    points: ['Primary CTA visibility', 'Form field friction count', 'Trust & social proof signals', 'Lead-path clarity checks'],
  },
  {
    icon: <Globe className="size-5" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: 'Local SEO',
    desc: 'Google Business Profile signals, NAP consistency, local schema, and city-specific keyword presence for locally-competing businesses.',
    points: ['NAP consistency checks', 'Local schema detection', 'Google Business signals', 'City keyword presence'],
  },
  {
    icon: <Sparkles className="size-5" />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    title: 'AI SEO & E-E-A-T',
    desc: 'Author bios, topical authority clusters, content freshness signals, LLMS.txt, and AI search readiness scoring aligned with Google's E-E-A-T framework.',
    points: ['Author expertise signals', 'Topical cluster analysis', 'Content freshness checks', 'AI readiness scoring'],
  },
];

const workflow = [
  { step: '01', title: 'Enter your URL', desc: 'Paste any website URL. No account needed to start a free preview audit.' },
  { step: '02', title: 'Live crawl runs', desc: 'Our engine crawls up to 300 pages across all 7 SEO modules in under 60 seconds.' },
  { step: '03', title: 'Review your score', desc: 'See your overall health score, module grades, and prioritized issue list instantly.' },
  { step: '04', title: 'Act on insights', desc: 'Use quick wins, the fix matrix, and the AI assistant to resolve issues fast.' },
];

export default function FeaturesPage() {
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
            Features
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            SEO audits built for action
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Run a real crawl, review prioritized issues, compare mobile and desktop performance, and turn findings into developer-ready fixes — all in one platform.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20"
          >
            <Link href="/">
              <Search className="size-4" />
              Run free audit
            </Link>
          </Button>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">7 audit modules</p>
          <h2 className="mt-2 text-3xl font-bold">Everything your site needs covered</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-slate-400">
            Each module surfaces scored issues with severity, effort, and fix guidance built in.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <div
              key={mod.title}
              className="group rounded-2xl border border-white/8 bg-slate-900 p-5 transition-all hover:-translate-y-0.5 hover:border-orange-500/25"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${mod.bg} ${mod.color}`}>
                {mod.icon}
              </div>
              <h3 className="mb-2 font-semibold">{mod.title}</h3>
              <p className="mb-4 text-sm leading-6 text-slate-400">{mod.desc}</p>
              <ul className="space-y-1.5">
                {mod.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="size-3.5 shrink-0 text-orange-400" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/8 bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">How it works</p>
            <h2 className="mt-2 text-3xl font-bold">From URL to action plan in 60 seconds</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {workflow.map((item) => (
              <div key={item.step} className="rounded-2xl border border-white/8 bg-slate-800/50 p-5 text-center">
                <span className="mb-3 inline-block text-3xl font-bold text-orange-500/40">{item.step}</span>
                <h3 className="mb-1.5 font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer tools strip */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Sparkles className="size-5" />,
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10',
              title: 'AI fix assistant',
              desc: 'Get AI-generated code snippets and fix guidance for each issue, tailored to your framework.',
            },
            {
              icon: <BarChart3 className="size-5" />,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              title: 'Priority matrix',
              desc: 'Issues plotted by impact vs effort so your team knows exactly what to tackle first.',
            },
            {
              icon: <FileText className="size-5" />,
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
              title: 'PDF reports',
              desc: 'Downloadable PDF reports for client sharing, stakeholder reviews, and audit documentation.',
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

      {/* CTA */}
      <section className="border-t border-white/8 bg-slate-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6">
          <p className="text-2xl font-bold">Ready to run your first audit?</p>
          <p className="max-w-md text-sm text-slate-400">Free preview with no login required. Upgrade to unlock the full fix report.</p>
          <Button
            asChild
            size="lg"
            className="mt-1 gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/25"
          >
            <Link href="/">
              Start free audit
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
