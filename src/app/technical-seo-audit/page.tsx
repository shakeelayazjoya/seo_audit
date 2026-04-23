import type { Metadata } from 'next';
import { ProposalLandingPage } from '@/components/landing/ProposalLandingPage';

export const metadata: Metadata = {
  title: 'Technical SEO Audit | Crawlability, Canonicals, Indexation',
  description:
    'Audit technical SEO issues including robots directives, canonicals, duplicate metadata, sitemap discovery, crawl depth, and indexation signals.',
};

export default function TechnicalSeoAuditPage() {
  return (
    <ProposalLandingPage
      eyebrow="Technical SEO"
      title="Technical SEO Audit For Crawlability And Indexation"
      description="Review the technical foundation of a site with live crawl data, rendered-page fallbacks, duplicate metadata analysis, and indexation-oriented issue scoring."
      bullets={[
        'Robots.txt, sitemap and llms.txt discovery',
        'Canonical, noindex and nofollow checks',
        'Duplicate title/meta and near-duplicate content detection',
        'Crawl depth and low-discovery page analysis',
      ]}
      focusChecks={[
        'HTTP status health and crawl errors',
        'Canonical consistency and indexation controls',
        'Duplicate metadata and content signatures',
        'Site architecture depth and crawl path clarity',
      ]}
      ctaLabel="Run Technical SEO Audit"
    />
  );
}
