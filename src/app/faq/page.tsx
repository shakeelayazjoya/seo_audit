import { InfoPage } from '@/components/marketing/InfoPage';

export default function FAQPage() {
  return (
    <InfoPage
      eyebrow="FAQ"
      title="Frequently asked questions"
      description="Straight answers about audit coverage, report delivery, login requirements, and what happens after an audit completes."
      sections={[
        {
          title: 'Do I need an account to run an audit?',
          body: 'No. Guests can run an audit with a website URL and email. The guest flow sends a preview PDF when the audit completes.',
        },
        {
          title: 'When do I get the full report?',
          body: 'The full report is unlocked for signed-in users. Logged-in audits receive the full PDF automatically when the audit completes.',
        },
        {
          title: 'What does the audit check?',
          body: 'The audit covers technical SEO, on-page content, performance, CRO, local SEO, AI SEO, and schema markup.',
        },
        {
          title: 'Can I get help fixing issues?',
          body: 'Yes. You can use the AI code-fix assistant, review framework-specific recommendations, book a strategy call, or contact support for implementation help.',
        },
      ]}
      ctaLabel="Start audit"
    />
  );
}
