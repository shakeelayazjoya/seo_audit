import type { Metadata } from 'next';
import { ProposalLandingPage } from '@/components/landing/ProposalLandingPage';

export const metadata: Metadata = {
  title: 'On-Page & Content SEO Audit | Titles, Headings, Keywords & Quality',
  description:
    'Audit on-page SEO signals including title tags, meta descriptions, heading hierarchy, keyword usage, content quality, image alt attributes, and internal linking.',
};

export default function OnPageContentPage() {
  return (
    <ProposalLandingPage
      eyebrow="On-Page & Content"
      title="On-Page & Content Audit For Relevance And Quality"
      description="Surface on-page optimisation gaps that limit organic visibility — from weak title tags and missing headings to thin content and unoptimised images."
      bullets={[
        'Title tag and meta description quality scoring',
        'Heading hierarchy and keyword placement analysis',
        'Content length, readability and thin-page detection',
        'Image alt attribute and internal linking checks',
      ]}
      focusChecks={[
        'Title tag uniqueness, length and primary keyword presence',
        'H1 / H2 structure and heading keyword alignment',
        'Word count, duplicate content and readability signals',
        'Image alt coverage and internal link anchor relevance',
      ]}
      ctaLabel="Run On-Page Audit"
    />
  );
}
