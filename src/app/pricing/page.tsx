import { InfoPage } from '@/components/marketing/InfoPage';

export default function PricingPage() {
  return (
    <InfoPage
      eyebrow="Pricing"
      title="Plans for every SEO workflow"
      description="Start with a free audit preview, then upgrade when you need complete fix plans, strategy support, or done-for-you implementation."
      sections={[
        {
          title: 'Free audit preview',
          body: 'Enter a website URL and email to receive a preview PDF and see the core audit summary.',
          points: ['Guest-friendly audit start', 'Preview PDF by email', 'Login required for the full report'],
        },
        {
          title: 'DIY Plan',
          body: 'Designed for developers and in-house teams who want the full report and implementation guidance.',
          points: ['Full PDF report', 'All fix guides', 'Priority matrix and quick wins'],
        },
        {
          title: 'Strategy Plan',
          body: 'For businesses that want expert prioritization and a focused action roadmap after the audit.',
          points: ['Strategy call booking', 'Custom action roadmap', 'Priority support'],
        },
        {
          title: 'Full Implementation',
          body: 'For teams that want help applying the highest-impact fixes after reviewing the report.',
          points: ['Done-for-you support', 'Direct WhatsApp contact', 'Implementation planning'],
        },
      ]}
      ctaLabel="Run free audit"
    />
  );
}
