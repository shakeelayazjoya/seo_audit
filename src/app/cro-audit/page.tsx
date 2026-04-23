import type { Metadata } from 'next';
import { ProposalLandingPage } from '@/components/landing/ProposalLandingPage';

export const metadata: Metadata = {
  title: 'CRO Audit | CTA Visibility, Form Friction, Trust Signals',
  description:
    'Audit conversion blockers across key pages by checking CTA visibility, above-the-fold action cues, form friction, trust signals, and contact accessibility.',
};

export default function CroAuditPage() {
  return (
    <ProposalLandingPage
      eyebrow="CRO Analysis"
      title="CRO Audit For CTA Clarity, Trust And Conversion Flow"
      description="Find the UX and persuasion gaps that turn organic traffic into lost leads, from weak calls to action to trust and contact friction."
      bullets={[
        'Primary CTA and above-the-fold action checks',
        'Form friction scoring and field-count analysis',
        'Trust and social-proof signal detection',
        'Contact accessibility issues surfaced in-page',
      ]}
      focusChecks={[
        'Primary CTA visibility and placement',
        'Form length and friction indicators',
        'Trust, review and proof-point signals',
        'Lead-path clarity on high-intent pages',
      ]}
      ctaLabel="Run CRO Audit"
    />
  );
}
