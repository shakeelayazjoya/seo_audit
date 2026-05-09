import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Lock, Server, Shield, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Privacy Policy — All In One SEO Audit',
  description:
    'Learn how All In One SEO Audit collects, uses, and protects your personal data. We are committed to full transparency and GDPR-compliant data practices.',
};

const sections = [
  {
    id: 'information-we-collect',
    icon: Eye,
    title: 'Information We Collect',
    content: [
      {
        heading: 'Information you provide directly',
        body: 'When you create an account, run an SEO audit, book a strategy call, or contact us, we collect information such as your name, email address, website URL, and any messages you send us.',
      },
      {
        heading: 'Information collected automatically',
        body: 'When you use our platform we automatically collect certain technical data including your IP address, browser type, operating system, pages visited, time spent on pages, and referring URLs. This information helps us improve your experience and maintain platform security.',
      },
      {
        heading: 'Audit data',
        body: 'When you run an SEO audit we process the publicly accessible content of the URL you submit. We do not access any non-public areas of your website. Audit results are stored so you can access your history and track progress over time.',
      },
    ],
  },
  {
    id: 'how-we-use',
    icon: Server,
    title: 'How We Use Your Information',
    content: [
      {
        heading: 'Delivering the service',
        body: 'We use your information to operate the platform, generate your SEO audit reports, send you results and recommendations, and provide customer support.',
      },
      {
        heading: 'Improving our platform',
        body: 'Aggregated and anonymised usage data helps us identify bugs, prioritise new features, and improve audit accuracy. We never sell individual user data.',
      },
      {
        heading: 'Communications',
        body: 'With your consent we may send you product updates, tips, and promotional offers. You can unsubscribe at any time via the link in any email or by contacting us directly.',
      },
      {
        heading: 'Legal compliance',
        body: 'We may process your data where necessary to comply with applicable law, enforce our Terms of Service, or protect the rights, property, or safety of our users.',
      },
    ],
  },
  {
    id: 'data-sharing',
    icon: UserCheck,
    title: 'Data Sharing & Third Parties',
    content: [
      {
        heading: 'We do not sell your data',
        body: 'We will never sell, rent, or trade your personal information to third parties for their own marketing purposes.',
      },
      {
        heading: 'Service providers',
        body: 'We share data with trusted third-party providers who help us operate the platform — including cloud hosting, email delivery, payment processing, and analytics. Each provider is bound by strict data-processing agreements and may only use your data to perform services on our behalf.',
      },
      {
        heading: 'Business transfers',
        body: 'If All In One SEO Audit is involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction. We will notify you before your data becomes subject to a different privacy policy.',
      },
    ],
  },
  {
    id: 'data-security',
    icon: Lock,
    title: 'Data Security',
    content: [
      {
        heading: 'Technical safeguards',
        body: 'All data is encrypted in transit using TLS and encrypted at rest. We use industry-standard access controls, regular security audits, and vulnerability scanning to protect your information.',
      },
      {
        heading: 'Incident response',
        body: 'In the event of a data breach that affects your personal information, we will notify you and relevant supervisory authorities within 72 hours as required by applicable law.',
      },
      {
        heading: 'Your responsibility',
        body: 'You are responsible for maintaining the confidentiality of your account credentials. Please use a strong, unique password and do not share it with others.',
      },
    ],
  },
  {
    id: 'your-rights',
    icon: ShieldCheck,
    title: 'Your Rights',
    content: [
      {
        heading: 'Access & portability',
        body: 'You have the right to request a copy of the personal data we hold about you in a structured, machine-readable format.',
      },
      {
        heading: 'Correction',
        body: 'If any information we hold about you is inaccurate or incomplete, you have the right to request that we correct it.',
      },
      {
        heading: 'Erasure',
        body: 'You may request deletion of your personal data at any time. We will honour such requests unless we are required to retain certain data by law or for legitimate business purposes.',
      },
      {
        heading: 'Objection & restriction',
        body: 'You have the right to object to or restrict certain types of processing, including direct marketing. Contact us at any time to exercise these rights.',
      },
    ],
  },
  {
    id: 'cookies',
    icon: Shield,
    title: 'Cookies & Tracking',
    content: [
      {
        heading: 'Essential cookies',
        body: 'We use essential cookies to keep you logged in and maintain your session. These cannot be disabled without breaking core platform functionality.',
      },
      {
        heading: 'Analytics cookies',
        body: 'With your consent we use analytics cookies to understand how visitors interact with our platform. This data is aggregated and helps us improve the product.',
      },
      {
        heading: 'Managing cookies',
        body: 'You can control cookies through your browser settings. Disabling non-essential cookies will not affect your ability to use the core audit features.',
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right,rgb(255,255,255) 1px,transparent 1px),linear-gradient(to bottom,rgb(255,255,255) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 text-center">
          <span className="mb-5 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
            <Sparkles className="mr-1.5 size-3" />
            Legal &amp; Privacy
          </span>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Privacy{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base leading-7 text-slate-400">
            We believe privacy is a right, not a privilege. This policy explains exactly what data we collect, why we collect it, and the controls you have over your information.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="size-3.5 text-orange-400" />
            <span>Last updated: <time dateTime="2026-05-10">10 May 2026</time></span>
          </div>

          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: 'GDPR Compliant', sub: 'EU data standards' },
              { label: 'No Data Sales', sub: 'Your data stays yours' },
              { label: 'TLS Encrypted', sub: 'End-to-end security' },
              { label: '72hr Breach Notice', sub: 'Regulatory commitment' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="rounded-xl border border-white/8 bg-slate-900/60 p-4 text-center backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-orange-400">{badge.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{badge.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Table of contents */}
      <section className="relative border-b border-white/8 bg-slate-900/30">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            On this page
          </p>
          <nav className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Content sections */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* Intro card */}
        <div className="mb-12 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 sm:p-8">
          <p className="text-sm leading-7 text-slate-300">
            This Privacy Policy applies to all products and services operated by{' '}
            <strong className="text-white">All In One SEO Audit</strong> and{' '}
            <strong className="text-white">Dexora Digital</strong>. By using our platform you agree to the collection and use of information described in this policy. If you do not agree, please discontinue use of our services and contact us to delete your account.
          </p>
        </div>

        <div className="space-y-14">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                {/* Section header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10">
                    <Icon className="size-4 text-orange-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Section {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
                  </div>
                </div>

                {/* Sub-sections */}
                <div className="rounded-2xl border border-white/8 bg-slate-900/40 divide-y divide-white/6">
                  {section.content.map((item) => (
                    <div key={item.heading} className="p-5 sm:p-6">
                      <h3 className="mb-2 text-sm font-semibold text-orange-300">
                        {item.heading}
                      </h3>
                      <p className="text-sm leading-7 text-slate-400">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact / Changes section */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10">
              <Shield className="size-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Changes to this Policy</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of material changes by email or by placing a prominent notice on our website at least 14 days before the change takes effect.
              </p>
              <h2 className="mt-6 text-lg font-bold">Contact Us</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at{' '}
                <a
                  href="mailto:ahmad@allinoneseoaudit.com"
                  className="text-orange-400 underline-offset-4 hover:underline"
                >
                  ahmad@allinoneseoaudit.com
                </a>{' '}
                or via our{' '}
                <Link href="/contact" className="text-orange-400 underline-offset-4 hover:underline">
                  contact page
                </Link>
                . We aim to respond to all requests within 30 days.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">Ready to get started?</p>
          <h2 className="mt-2 text-2xl font-bold">Run your free SEO audit now</h2>
          <p className="mt-2 text-sm text-slate-400">
            No credit card required. Results in under 60 seconds.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20"
            >
              <Link href="/">
                Start free audit
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
