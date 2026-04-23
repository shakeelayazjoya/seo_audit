import type { Metadata } from 'next';
import { ProposalLandingPage } from '@/components/landing/ProposalLandingPage';

export const metadata: Metadata = {
  title: 'AI SEO Audit | E-E-A-T, FAQ, Freshness and llms.txt',
  description:
    'Evaluate AI-readiness and E-E-A-T signals such as authorship, citations, freshness, FAQ depth, entity clarity, and llms.txt availability.',
};

export default function AiSeoAuditPage() {
  return (
    <ProposalLandingPage
      eyebrow="AI SEO / E-E-A-T"
      title="AI SEO Audit For E-E-A-T, Entity Clarity And Freshness"
      description="Inspect how well a website supports modern AI-assisted discovery with author signals, citations, FAQ presence, topical clustering, and freshness indicators."
      bullets={[
        'Authorship and citation signal checks',
        'FAQ-style content and structured Q&A opportunities',
        'Brand/entity reinforcement analysis',
        'llms.txt and freshness visibility checks',
      ]}
      focusChecks={[
        'Author, reviewer and citation signal strength',
        'FAQ and question-driven content opportunities',
        'Entity clarity across titles and summaries',
        'Content freshness and llms.txt coverage',
      ]}
      ctaLabel="Run AI SEO Audit"
    />
  );
}
