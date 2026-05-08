import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, BriefcaseBusiness, Globe, Linkedin, MessageCircle, Shield, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import haiderImage from '../../../public/haider.jpeg';

const taqweemWhatsappUrl = 'https://wa.me/358449568407?text=Hi%20Taqweem%2C%20I%20need%20help%20with%20my%20SEO%20audit.';

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

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
              <div className="grid gap-0 sm:grid-cols-[0.9fr_1.1fr] lg:grid-cols-1">
                <div className="relative min-h-[340px] bg-orange-500">
                  <Image
                    src="https://dexoradigital.com/wp-content/uploads/2026/01/Dexora-Team.png"
                    alt="Taqweem Ahmad - Founder"
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 1024px) 100vw, 460px"
                    priority
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">Founder</p>
                  <h2 className="mt-2 text-2xl font-bold">Taqweem Ahmad</h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
                    <p>
                      I am Taqweem Ahmad, Founder of Dexora Digital and the creator of All In One SEO Audit. I have spent the last 5 plus years helping over 100 businesses across the USA, UK, and Australia grow their organic traffic, dominate Google Maps, and appear in AI search recommendations on ChatGPT, Perplexity, and Google AI Overviews.
                    </p>
                    <p>
                      I built this tool because every free audit tool I used either checked one thing or gave vague recommendations that led nowhere. This platform checks everything simultaneously and tells you exactly what to fix first based on real impact and real data.
                    </p>
                    <p>
                      I am Top Rated on Upwork with 100 percent Job Success and have delivered results including a Shopify store reaching $1,080,000 in sales through organic SEO alone and an engineering firm going from zero to 265,000 impressions in 12 months. This tool is the same diagnostic process I use for every client, now available to any business owner in 60 seconds for free.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild size="sm" className="gap-2 bg-orange-500 text-white hover:bg-orange-400">
                      <a href="https://www.linkedin.com/in/taqweem-ahmad/" target="_blank" rel="noreferrer">
                        <Linkedin className="size-4" />
                        LinkedIn
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10">
                      <a href="https://www.upwork.com/freelancers/taqweema" target="_blank" rel="noreferrer">
                        <BriefcaseBusiness className="size-4" />
                        Upwork
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-2 border-green-400/25 bg-green-500/10 text-green-200 hover:bg-green-500/20">
                      <a href={taqweemWhatsappUrl} target="_blank" rel="noreferrer">
                        <MessageCircle className="size-4" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Co-founder section */}
      <section className="relative overflow-hidden border-b border-white/8 bg-black">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.16),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.1),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-18 sm:px-6 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-300">
                <Sparkles className="mr-1.5 size-3" />
                Co-founder built
              </span>
              <h2 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
                The co-founder-built SEO audit platform for growth-focused teams.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
                Built after years of running technical SEO campaigns for ambitious brands across the USA, UK, and Australia — this platform combines agency-grade process with a fast, modern product experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400">
                  <Link href="/">
                    Run a Free Audit
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <Link href="/contact">
                    <MessageCircle className="size-4" />
                    Talk to Me Directly
                  </Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 md:grid-cols-3">
                {[
                  { label: '5+ Years', value: 'Technical SEO & GEO/AEO experience' },
                  { label: '100+ Businesses', value: 'Helped across 3 international markets' },
                  { label: 'USA · UK · Australia', value: "Where I've delivered real results" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-xl font-bold text-orange-300">{stat.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
              <div className="grid gap-0 sm:grid-cols-[0.9fr_1.1fr] lg:grid-cols-1">
                <div className="relative min-h-[340px] bg-orange-500">
                  <Image
                    src={haiderImage}
                    alt="Syed Haider Shah - Co-Founder"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 460px"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">Co-Founder</p>
                  <h3 className="mt-2 text-2xl font-bold">Syed Haider Shah</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
                    <p>
                      I'm a Technical SEO specialist with hands-on experience running campaigns across three markets. I've done the audits, fixed the crawl errors, built the content strategies, and tracked the rankings — for businesses ranging from dental equipment brands in the USA to commercial fitout firms in Australia.
                    </p>
                    <p>
                      I built this platform because the tools available didn't think like an SEO practitioner. They flagged issues without prioritizing them. They gave data without direction.
                    </p>
                    <p>
                      This is the audit platform I wished existed when I was in the trenches. Technical depth, agency-grade thinking, and a product experience that actually tells you what to fix first.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild size="sm" className="gap-2 bg-orange-500 text-white hover:bg-orange-400">
                      <a href="https://pk.linkedin.com/in/haider786shah" target="_blank" rel="noreferrer">
                        <Linkedin className="size-4" />
                        Syed on LinkedIn
                      </a>
                    </Button>
                  </div>
                </div>
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
