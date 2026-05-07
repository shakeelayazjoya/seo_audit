import type { Metadata } from 'next';
import { ProposalLandingPage } from '@/components/landing/ProposalLandingPage';

export const metadata: Metadata = {
  title: 'Schema Markup Audit | Structured Data, JSON-LD & Rich Snippets',
  description:
    'Audit structured data implementation including JSON-LD schema types, breadcrumb markup, FAQ schema, Organisation and WebSite schemas, and rich snippet eligibility.',
};

export default function SchemaMarkupPage() {
  return (
    <ProposalLandingPage
      eyebrow="Schema Markup"
      title="Schema Markup Audit For Rich Snippets And Structured Data"
      description="Uncover missing or broken structured data that blocks rich snippet eligibility — covering JSON-LD coverage, schema type validation, and breadcrumb integrity."
      bullets={[
        'JSON-LD schema detection and type coverage',
        'BreadcrumbList, FAQ, Article and Product schema checks',
        'Organisation, WebSite and SiteLinks searchbox signals',
        'Structured data errors and missing required properties',
      ]}
      focusChecks={[
        'JSON-LD presence and schema type breadth',
        'BreadcrumbList accuracy and nesting',
        'FAQ and HowTo schema eligibility for rich results',
        'Required property completeness for each schema type',
      ]}
      ctaLabel="Run Schema Markup Audit"
    />
  );
}
