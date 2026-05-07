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
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-600">{eyebrow}</p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
              <Button asChild className="mt-8 gap-2">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {heroImageSrc && (
              <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt ?? title}
                  width={340}
                  height={340}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.body}</p>
            {section.points && (
              <ul className="mt-4 space-y-2">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-orange-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
