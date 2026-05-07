import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Shield, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-slate-900">
      <section className="border-b border-slate-200 bg-gradient-to-b from-muted/60 via-background to-background">
        <div className="mx-auto max-w-7xl px-4  py-4 sm:px-6">
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/10">
            <Sparkles className="mr-1 size-3" />
            About Dexora Digital
          </Badge>

          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                The founder-led SEO platform built for growth-focused teams.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                I built this audit platform after years of running campaigns for ambitious brands in the USA, UK, and Australia. It combines agency-grade SEO process with an easy, modern product experience.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="bg-orange-500 text-white hover:bg-orange-400">
                  <Link href="/seo-audit-tool">
                    Run a free audit
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Talk to our team</Link>
                </Button>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  { label: '5+ years', value: 'SEO experience' },
                  { label: '100+', value: 'businesses helped' },
                  { label: '3 markets', value: 'USA · UK · Australia' },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-xl font-semibold text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ==================== UPDATED FOUNDER CARD ==================== */}
            <Card className="overflow-hidden bg-slate-950 text-white shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between bg-slate-900 px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.5px] text-slate-400">FOUNDER</p>
                  <h2 className="text-2xl font-semibold text-white">Taqweem Ahmad</h2>
                </div>
                <div className="rounded-full bg-orange-500/10 p-2 text-orange-400">
                  <Sparkles className="size-5" />
                </div>
              </div>

              <div className="relative h-[360px] w-full overflow-hidden">
                <Image
                  src="https://dexoradigital.com/wp-content/uploads/2026/01/Dexora-Team.png"
                  alt="Taqweem Ahmad - Founder of Dexora Digital"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 500px"
                  priority
                />
              </div>

              <CardContent className="space-y-6 bg-slate-950 p-6">
                <p className="text-sm leading-relaxed text-slate-300">
                  I turned agency experience into a performance-first SEO platform 
                  that helps teams discover hidden issues and prioritize fast wins.
                </p>

                
              </CardContent>
            </Card>
            {/* ==================== END UPDATED CARD ==================== */}

          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 grid gap-6 md:grid-cols-[0.3fr_1fr] md:items-center">
          <div className="rounded-3xl bg-primary/5 p-5 text-primary">
            <Shield className="size-5" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-slate-950">Built for modern SEO workflows</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Every part of this page follows the same process used by the platform: clear audit results, practical recommendations, and a fast path to action.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 rounded-lg bg-primary/10 p-2 text-primary w-fit">
                <Zap className="size-4" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Real audit cadence</h3>
              <p className="text-sm text-slate-600">
                This site is designed to showcase the same audit-first thinking that powers our reports and recommendations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 rounded-lg bg-primary/10 p-2 text-primary w-fit">
                <Shield className="size-4" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Trustworthy process</h3>
              <p className="text-sm text-slate-600">
                Every insight is rooted in proven SEO strategy, not generic marketing claims.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 rounded-lg bg-primary/10 p-2 text-primary w-fit">
                <Sparkles className="size-4" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Actionable clarity</h3>
              <p className="text-sm text-slate-600">
                We focus on the few changes that deliver the biggest traffic and technical wins.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-200">
                Founder story
              </span>
              <h2 className="mt-6 text-4xl font-semibold tracking-tight">Why I built this tool</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                After working with dozens of brands, I saw the same problem: high-quality SEO insights were hidden behind complex dashboards or expensive retainers. This platform is designed to make those insights simple, fast, and directly usable.
              </p>
            </div>
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
              {[
                'Built for busy founders and marketing teams',
                'Designed around audits that lead to action',
                'Focused on measurable traffic and revenue outcomes',
              ].map((item) => (
                <div key={item} className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}