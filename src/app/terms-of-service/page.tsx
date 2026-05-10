import type { Metadata } from 'next';
import {
  AlertTriangle,
  Ban,
  BookOpen,
  CreditCard,
  FileText,
  Gavel,
  RefreshCw,
  Scale,
  ScrollText,
  Shield,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — All In One SEO Audit',
  description:
    'Read the Terms of Service for All In One SEO Audit. Understand your rights, responsibilities, and the rules that govern the use of our platform.',
};

const sections = [
  {
    id: 'acceptance',
    icon: FileText,
    title: 'Acceptance of Terms',
    content: [
      {
        heading: 'Agreement to these terms',
        body: 'By accessing or using the All In One SEO Audit platform — whether by visiting our website, creating an account, or running an audit — you confirm that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use immediately.',
      },
      {
        heading: 'Eligibility',
        body: 'You must be at least 16 years of age and capable of forming a legally binding contract to use our services. By using the platform you represent that you meet these requirements. If you are using the platform on behalf of a business, you represent that you have authority to bind that business to these terms.',
      },
      {
        heading: 'Updates to these terms',
        body: 'We may revise these Terms of Service at any time. Material changes will be communicated via email or a prominent notice on our platform at least 14 days before they take effect. Continued use of the platform after that date constitutes acceptance of the revised terms.',
      },
    ],
  },
  {
    id: 'use-of-service',
    icon: BookOpen,
    title: 'Use of the Service',
    content: [
      {
        heading: 'Permitted use',
        body: 'You may use the platform to run SEO audits on websites you own or have explicit permission to analyse. Our tools are designed for legitimate search-engine optimisation and digital marketing purposes.',
      },
      {
        heading: 'Account responsibility',
        body: 'You are solely responsible for all activity that occurs under your account. Keep your credentials secure and notify us immediately at support@allinoneSEOaudit.com if you suspect any unauthorised access. We are not liable for any loss or damage arising from your failure to protect your account.',
      },
      {
        heading: 'Fair use',
        body: 'You agree not to use the service in a way that places an unreasonable or disproportionately large load on our infrastructure. Automated bulk requests, scraping of our reports, or any activity that degrades service quality for other users is prohibited.',
      },
    ],
  },
  {
    id: 'prohibited-conduct',
    icon: Ban,
    title: 'Prohibited Conduct',
    content: [
      {
        heading: 'Illegal and harmful activities',
        body: 'You may not use the platform to violate any applicable law or regulation, infringe the intellectual-property rights of others, transmit malware or malicious code, or engage in any activity that is fraudulent, abusive, or harmful to others.',
      },
      {
        heading: 'Reverse engineering',
        body: 'You may not attempt to reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code, algorithms, or underlying technology of the platform.',
      },
      {
        heading: 'Audit of unauthorised websites',
        body: 'Running an audit on a website you do not own or do not have explicit written authorisation to analyse is strictly prohibited. We reserve the right to suspend accounts we suspect of misuse without prior notice.',
      },
      {
        heading: 'Resale without permission',
        body: 'You may not resell, sublicence, or commercialise access to our platform or audit reports without our express written consent. White-label and agency arrangements require a separate partnership agreement.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    icon: Shield,
    title: 'Intellectual Property',
    content: [
      {
        heading: 'Our intellectual property',
        body: 'All content, software, algorithms, designs, trademarks, and logos on the platform are the exclusive property of All In One SEO Audit and Dexora Digital, protected by copyright, trade-secret, and other intellectual-property laws. You are granted a limited, non-exclusive, non-transferable licence to use the platform solely for its intended purpose.',
      },
      {
        heading: 'Your content',
        body: 'You retain full ownership of the websites and content you submit for auditing. By submitting a URL you grant us a limited licence to access and process that publicly available content solely for the purpose of generating your audit report.',
      },
      {
        heading: 'Audit reports',
        body: 'Audit reports generated for your account are for your personal or business use only. You may share them internally or with clients you represent, but may not republish them publicly or commercially without attribution.',
      },
    ],
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: 'Payments & Subscriptions',
    content: [
      {
        heading: 'Billing',
        body: 'Paid plans are billed on a recurring monthly or annual basis, depending on your chosen plan. You authorise us to charge your payment method on file at each renewal date. All prices are displayed exclusive of applicable taxes unless stated otherwise.',
      },
      {
        heading: 'Free trial',
        body: 'Where a free trial is offered, no charge is made until the trial period expires. You may cancel before the trial ends to avoid any charges. Trial eligibility is limited to one trial per person or business.',
      },
      {
        heading: 'Refunds',
        body: 'We offer a 7-day money-back guarantee on first-time paid subscriptions if you are not satisfied. Refund requests must be submitted to support@allinoneSEOaudit.com within 7 days of the initial charge. Subsequent billing cycles are non-refundable except where required by applicable law.',
      },
      {
        heading: 'Cancellation',
        body: 'You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period; you will retain access to paid features until that date.',
      },
    ],
  },
  {
    id: 'disclaimers',
    icon: AlertTriangle,
    title: 'Disclaimers & Limitations',
    content: [
      {
        heading: 'No guarantee of results',
        body: 'SEO is an inherently dynamic discipline. While our audits and recommendations reflect current best practices and industry standards, we make no guarantee that following our recommendations will result in specific ranking improvements, traffic increases, or business outcomes.',
      },
      {
        heading: '"As is" service',
        body: 'The platform is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the service will be error-free or uninterrupted.',
      },
      {
        heading: 'Limitation of liability',
        body: 'To the maximum extent permitted by applicable law, All In One SEO Audit and Dexora Digital shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform. Our total aggregate liability shall not exceed the amount paid by you in the 12 months preceding the claim.',
      },
    ],
  },
  {
    id: 'termination',
    icon: RefreshCw,
    title: 'Termination',
    content: [
      {
        heading: 'Termination by you',
        body: 'You may close your account at any time by visiting your account settings or contacting support. Upon closure, your personal data will be handled in accordance with our Privacy Policy.',
      },
      {
        heading: 'Termination by us',
        body: 'We reserve the right to suspend or terminate your access to the platform immediately, without prior notice, if we believe you have violated these Terms of Service or if your use poses a risk to the platform, other users, or third parties.',
      },
      {
        heading: 'Effect of termination',
        body: 'Upon termination, your licence to use the platform ceases immediately. Provisions that by their nature should survive termination — including intellectual property, disclaimers, and limitations of liability — will remain in effect.',
      },
    ],
  },
  {
    id: 'governing-law',
    icon: Gavel,
    title: 'Governing Law & Disputes',
    content: [
      {
        heading: 'Governing law',
        body: 'These Terms of Service are governed by and construed in accordance with the laws of England and Wales, without regard to its conflict-of-law provisions.',
      },
      {
        heading: 'Dispute resolution',
        body: 'We encourage you to contact us first at support@allinoneSEOaudit.com so we can try to resolve any dispute informally. If a dispute cannot be resolved informally within 30 days, it shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
      },
      {
        heading: 'Severability',
        body: 'If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect.',
      },
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ── Hero ───────────────────────────────────────────────── */}
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

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 text-center">
          {/* Badge */}
          <span className="mb-5 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
            <Sparkles className="mr-1.5 size-3" />
            Legal &amp; Terms
          </span>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Terms of{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              Service
            </span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base leading-7 text-slate-400">
            These terms govern your access to and use of All In One SEO Audit. Please read them carefully — they define your rights, our responsibilities, and the rules that make the platform work for everyone.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Scale className="size-3.5 text-orange-400" />
            <span>
              Last updated: <time dateTime="2026-05-10">10 May 2026</time>
            </span>
          </div>

          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: 'Plain English', sub: 'No legal jargon' },
              { label: '7-Day Refund', sub: 'First subscription only' },
              { label: 'GDPR Aligned', sub: 'EU data standards' },
              { label: 'Fair Use Policy', sub: 'Transparent limits' },
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

      {/* ── Table of contents ──────────────────────────────────── */}
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

      {/* ── Content ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* Intro card */}
        <div className="mb-12 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex size-8 flex-shrink-0 items-center justify-center rounded-lg border border-orange-500/25 bg-orange-500/10">
              <ScrollText className="size-4 text-orange-400" />
            </div>
            <p className="text-sm leading-7 text-slate-300">
              These Terms of Service (<strong className="text-white">&ldquo;Terms&rdquo;</strong>) constitute a legally binding agreement between you and{' '}
              <strong className="text-white">All In One SEO Audit</strong> (operated by{' '}
              <strong className="text-white">Dexora Digital</strong>). By accessing or using our platform you agree to these Terms in full. If you do not agree, please do not use our services and contact us to close your account.
            </p>
          </div>
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

        {/* ── Contact footer ─────────────────────────────────────── */}
        <div className="mt-20 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent p-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10">
            <UserCheck className="size-5 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold">Questions about these terms?</h2>
          <p className="mt-2 text-sm text-slate-400">
            We are happy to clarify anything. Reach our legal team directly and we will respond within one business day.
          </p>
          <a
            href="mailto:allinoneseoaudittool@gmail.com"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-6 py-2.5 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/20 hover:text-orange-200"
          >
            allinoneseoaudittool@gmail.com
          </a>
        </div>
      </section>
    </main>
  );
}
