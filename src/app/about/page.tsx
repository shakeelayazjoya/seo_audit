import { InfoPage } from '@/components/marketing/InfoPage';

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="All In One SEO Audit Tool"
      description="A practical audit platform for teams that need clear SEO findings, credible scoring, and fix guidance they can act on immediately."
      sections={[
        {
          title: 'Why it exists',
          body: 'Many SEO reports surface issues without helping teams decide what to fix first. This platform connects crawl data, prioritization, and implementation guidance.',
          points: ['Actionable issue ranking', 'Quick wins first', 'Developer-friendly recommendations'],
        },
        {
          title: 'What we value',
          body: 'The product is built around clarity, credibility, and practical next steps instead of inflated scores or generic advice.',
          points: ['Real crawl-based analysis', 'Transparent partial-audit warnings', 'Email and PDF workflows'],
        },
        {
          title: 'Who it helps',
          body: 'It is useful for founders, agencies, developers, and marketers who need a fast audit workflow and a clear handoff from diagnosis to fixes.',
          points: ['Marketing teams', 'SEO consultants', 'Development teams'],
        },
        {
          title: 'Support',
          body: 'Users can contact the team directly for audit interpretation, booking, or implementation support.',
          points: ['WhatsApp support', 'Email support', 'Strategy call booking'],
        },
      ]}
      ctaLabel="Contact support"
      ctaHref="/contact"
    />
  );
}
