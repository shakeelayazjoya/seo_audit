import { ContactSection } from '@/components/seo/ContactSection';

export default function ContactPage() {
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

        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
            Contact
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Talk to support</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
            Send a message about your audit, booking, report, or implementation support. We reply fast.
          </p>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
