import type { Metadata } from 'next';
import { ProposalLandingPage } from '@/components/landing/ProposalLandingPage';

export const metadata: Metadata = {
  title: 'Local SEO Audit | NAP, Location Pages, LocalBusiness Schema',
  description:
    'Audit local SEO foundations including contact signals, location-page coverage, map embeds, local keyword reinforcement, and LocalBusiness markup.',
};

export default function LocalSeoAuditPage() {
  return (
    <ProposalLandingPage
      eyebrow="Local SEO"
      title="Local SEO Audit For Multi-Location And Service-Area Visibility"
      description="Measure the local trust and location signals that help businesses rank in city-focused search experiences and convert nearby visitors."
      bullets={[
        'Contact signal and NAP consistency checks',
        'Location-page discovery and map-embed coverage',
        'Local keyword reinforcement in page content',
        'LocalBusiness and organization schema analysis',
      ]}
      focusChecks={[
        'Phone, email and address visibility',
        'Location page depth and local relevance',
        'Map and service-area signal presence',
        'LocalBusiness / Organization schema coverage',
      ]}
      ctaLabel="Run Local SEO Audit"
    />
  );
}
