import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfoPageProps {
  eyebrow: string;
  title: string;
  description: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  sections: Array<{
    title: string;
    body: string;
    points?: string[];
  }>;
  ctaLabel?: string;
  ctaHref?: string;
}

export function InfoPage({
  eyebrow,
  title,
  description,
  heroImageSrc,
  heroImageAlt,
  sections,
  ctaLabel = 'Start free audit',
  ctaHref = '/',
}: InfoPageProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        {/* grid bg */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right,rgb(255,255,255) 1px,transparent 1px),linear-gradient(to bottom,rgb(255,255,255) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
            <div>
              <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
                {eyebrow}
              </span>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">{description}</p>
              <Button
                asChild
                className="mt-8 gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20"
              >
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {heroImageSrc ? (
              <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt ?? title}
                  width={380}
                  height={380}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-2">
        {sections.map((section, i) => (
          <article
            key={section.title}
            className="group relative overflow-hidden rounded-2xl border border-white/8 bg-slate-900 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-orange-500/5 hover:shadow-lg"
          >
            {/* accent stripe */}
            <div className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="mb-4 inline-flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-sm font-bold text-orange-400">
              {i + 1}
            </span>
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{section.body}</p>
            {section.points && (
              <ul className="mt-4 space-y-2">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-orange-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      {/* Bottom CTA banner */}
      <section className="border-t border-white/8 bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6">
          <p className="text-2xl font-semibold">Ready to improve your SEO?</p>
          <p className="max-w-md text-sm text-slate-400">
            Get a full site audit in under 60 seconds — free preview, no credit card required.
          </p>
          <Button
            asChild
            className="mt-2 gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/25"
          >
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
