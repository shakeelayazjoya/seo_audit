import type { Metadata } from 'next';
import { ProposalLandingPage } from '@/components/landing/ProposalLandingPage';

export const metadata: Metadata = {
  title: 'SEO Audit Tool | Technical, Content, CRO and Performance Checks',
  description:
    'Run a live multi-module SEO audit covering technical SEO, content, performance, CRO, local SEO, AI readiness, and schema markup.',
};

export default function SeoAuditToolPage() {
  return (
    <ProposalLandingPage
      eyebrow="All-in-One Audit"
      title="SEO Audit Tool Built For Live Site Diagnostics"
      description="Analyze real pages with a multi-module audit workflow that surfaces crawl, content, performance, CRO, local SEO, AI-readiness, and schema opportunities."
      bullets={[
        'Live crawl-based scoring across seven modules',
        'Recent audit history and score trend visibility',
        'Issue prioritization with quick wins and effort matrix',
        'Landing-page route built for organic acquisition',
      ]}
      focusChecks={[
        'Technical SEO crawlability, canonicals, meta robots, sitemap and crawl depth signals',
        'On-page content quality, title/meta quality, headings, duplicate content and image attributes',
        'Performance scoring backed by PageSpeed or Lighthouse when available',
        'Conversion, local, AI-readiness and structured-data signals in one report',
      ]}
      ctaLabel="Start A Free SEO Audit"
    />
  );
}
