import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    category: 'Getting started',
    items: [
      {
        q: 'Do I need an account to run an audit?',
        a: 'No. Guests can run an audit with just a website URL and email address. The guest flow delivers a preview PDF when the audit completes. Login is required to unlock the full report and fix guides.',
      },
      {
        q: 'How long does an audit take?',
        a: 'Most audits complete in under 60 seconds. We crawl up to 300 pages across 7 SEO modules including technical, on-page, performance, CRO, local SEO, AI/E-E-A-T, and schema markup.',
      },
      {
        q: 'What websites can I audit?',
        a: 'Any publicly accessible website can be audited. The crawler works with static sites, Next.js apps, WordPress, Shopify, and custom-built web apps.',
      },
    ],
  },
  {
    category: 'Reports & results',
    items: [
      {
        q: 'When do I get the full report?',
        a: 'The full report — including all fix guides, the priority matrix, quick wins, and the AI fix assistant — is unlocked for signed-in users immediately after the audit completes.',
      },
      {
        q: 'What does the audit actually check?',
        a: 'The audit covers: Technical SEO (canonicals, crawlability, sitemaps, indexation), On-Page (titles, meta, headings, duplicate content), Performance (Core Web Vitals, LCP, CLS, INP), CRO (CTA clarity, form friction, trust signals), Local SEO (NAP, Google Business signals), AI SEO / E-E-A-T (author expertise, topical authority), and Schema Markup.',
      },
      {
        q: 'Can I download my report as a PDF?',
        a: 'Yes. Signed-in users receive a full PDF report by email and can re-download it from their audit history dashboard at any time.',
      },
    ],
  },
  {
    category: 'Fix guidance & support',
    items: [
      {
        q: 'Can I get help fixing the issues found?',
        a: 'Yes. You can use the AI code-fix assistant for instant code-level guidance, review framework-specific recommendations (Next.js, React, Vanilla JS), book a strategy call, or contact our team directly for full implementation support.',
      },
      {
        q: 'How accurate are the audit results?',
        a: "Performance metrics use the same methodology as Google's PageSpeed Insights and Lighthouse. Technical and on-page checks follow industry best practices aligned with Google's Search Quality Evaluator Guidelines.",
      },
      {
        q: 'How often should I audit my site?',
        a: 'We recommend running audits at least monthly, or after any significant website changes. The Strategy and Full Implementation plans include automated monthly re-audit reminders so you can track progress continuously.',
      },
    ],
  },
  {
    category: 'Plans & billing',
    items: [
      {
        q: 'What is included in the free plan?',
        a: 'The free plan gives every guest a full site crawl, an overall SEO health score (0–100), module grades (A–F), a preview of the top issues, and a preview PDF by email.',
      },
      {
        q: 'Can I audit multiple websites?',
        a: "Yes. There's no limit on the number of websites you can audit. Create a free account to track all your audit history and monitor improvements across multiple domains.",
      },
      {
        q: 'Do paid plans auto-renew?',
        a: 'The DIY Plan and Strategy Plan are one-time purchases with no subscription. Full Implementation is a custom engagement billed separately based on scope.',
      },
    ],
  },
];

export default function FAQPage() {
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

        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
            FAQ
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">
            Straight answers about audit coverage, report delivery, login requirements, fix guidance, and billing.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-400">
                {section.category}
              </p>
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map(({ q, a }) => (
                  <AccordionItem
                    key={q}
                    value={q}
                    className="overflow-hidden rounded-xl border border-white/8 bg-slate-900 px-4 data-[state=open]:border-orange-500/30"
                  >
                    <AccordionTrigger className="py-4 text-left text-sm font-semibold text-white hover:no-underline">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-7 text-slate-400">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/8 bg-slate-900">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6">
          <p className="text-xl font-semibold">Still have questions?</p>
          <p className="max-w-sm text-sm text-slate-400">
            Our team is happy to help. Send a message and we'll get back to you quickly.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20"
            >
              <Link href="/contact">
                Contact support
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/">Start free audit</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
