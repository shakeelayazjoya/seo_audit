import { ContactSection } from '@/components/seo/ContactSection';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-600">Contact</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Talk to support</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Send a message about your audit, booking, report, or implementation support.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <ContactSection />
      </section>
    </main>
  );
}
