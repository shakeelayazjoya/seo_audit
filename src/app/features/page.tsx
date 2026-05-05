import { InfoPage } from '@/components/marketing/InfoPage';

export default function FeaturesPage() {
  return (
    <InfoPage
      eyebrow="Features"
      title="SEO audits built for action"
      description="Run a real crawl, review prioritized issues, compare mobile and desktop performance, and turn findings into developer-ready fixes."
      sections={[
        {
          title: 'Seven audit modules',
          body: 'The platform reviews the website across technical SEO, on-page content, performance, CRO, local SEO, AI SEO, and schema markup.',
          points: ['Weighted overall score', 'Module-by-module raw metrics', 'Issue severity and priority ranking'],
        },
        {
          title: 'Developer fix guidance',
          body: 'Each issue can include implementation guidance and framework-specific recommendations for Vanilla JS, React, and Next.js.',
          points: ['Code-level recommendations', 'AI fix assistant', 'Full fix plans for logged-in users'],
        },
        {
          title: 'Performance reporting',
          body: 'Performance analysis is split by device so users can compare mobile and desktop results more clearly.',
          points: ['Mobile and desktop tabs', 'Core Web Vitals metrics', 'Provider notes for confidence'],
        },
        {
          title: 'Reporting workflow',
          body: 'Reports can be viewed in the dashboard, exported as PDFs, emailed to users, and stored for history tracking.',
          points: ['Preview report for guests', 'Full PDF for signed-in users', 'Domain trend history'],
        },
      ]}
    />
  );
}
