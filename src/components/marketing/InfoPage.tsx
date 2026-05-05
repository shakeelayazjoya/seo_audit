import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/marketing/PublicHeader';

interface InfoPageProps {
  eyebrow: string;
  title: string;
  description: string;
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
  sections,
  ctaLabel = 'Start free audit',
  ctaHref = '/',
}: InfoPageProps) {
  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <PublicHeader />

      <section className="border-b bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
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
