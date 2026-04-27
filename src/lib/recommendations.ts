import type { AuditIssue, IssueRecommendation, RecommendationSnippet } from '@/lib/types';

interface RecommendationRule {
  id: string;
  category: IssueRecommendation['category'];
  matches: (issue: AuditIssue) => boolean;
  build: (issue: AuditIssue) => IssueRecommendation;
}

function buildRecommendation(
  id: string,
  category: IssueRecommendation['category'],
  headline: string,
  explanation: string,
  bestPractice: string,
  snippets: RecommendationSnippet[]
): IssueRecommendation {
  return {
    id,
    category,
    headline,
    explanation,
    bestPractice,
    snippets,
  };
}

function normalizeIssue(issue: AuditIssue) {
  return `${issue.title} ${issue.description} ${issue.fixGuide}`.toLowerCase();
}

const recommendationRules: RecommendationRule[] = [
  {
    id: 'image-optimization',
    category: 'performance',
    matches: (issue) => {
      const text = normalizeIssue(issue);
      return /image-loading opportunities|images missing alt|lazy load|image/.test(text);
    },
    build: (issue) =>
      buildRecommendation(
        'image-optimization',
        'performance',
        'Ship smaller, responsive images and delay offscreen media',
        `${issue.title} usually means the page is loading oversized or eager images that slow the first render and waste bandwidth on smaller screens.`,
        'Use modern formats like WebP or AVIF, provide responsive sizes, lazy-load offscreen assets, and always set width/height so layout stays stable.',
        [
          {
            framework: 'vanilla',
            title: 'Responsive image with lazy loading',
            language: 'html',
            code: `<picture>
  <source
    type="image/avif"
    srcset="/images/hero-640.avif 640w, /images/hero-1280.avif 1280w"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  <source
    type="image/webp"
    srcset="/images/hero-640.webp 640w, /images/hero-1280.webp 1280w"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  <img
    src="/images/hero-1280.jpg"
    srcset="/images/hero-640.jpg 640w, /images/hero-1280.jpg 1280w"
    sizes="(max-width: 768px) 100vw, 50vw"
    alt="Product dashboard preview"
    loading="lazy"
    decoding="async"
    width="1280"
    height="720"
  />
</picture>`,
          },
          {
            framework: 'react',
            title: 'Reusable React image component',
            language: 'tsx',
            code: `type ResponsiveImageProps = {
  alt: string;
  fallbackSrc: string;
  webpSrcSet: string;
  avifSrcSet?: string;
  sizes?: string;
  width: number;
  height: number;
};

export function ResponsiveImage({
  alt,
  fallbackSrc,
  webpSrcSet,
  avifSrcSet,
  sizes = '(max-width: 768px) 100vw, 50vw',
  width,
  height,
}: ResponsiveImageProps) {
  return (
    <picture>
      {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} /> : null}
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={fallbackSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto' }}
      />
    </picture>
  );
}`,
          },
          {
            framework: 'next',
            title: 'Next.js image optimization',
            language: 'tsx',
            code: `import Image from 'next/image';

export function HeroImage() {
  return (
    <Image
      src="/images/hero-dashboard.webp"
      alt="Product dashboard preview"
      width={1280}
      height={720}
      sizes="(max-width: 768px) 100vw, 50vw"
      priority={false}
      loading="lazy"
      style={{ width: '100%', height: 'auto' }}
    />
  );
}`,
          },
        ]
      ),
  },
  {
    id: 'javascript-optimization',
    category: 'performance',
    matches: (issue) => {
      const text = normalizeIssue(issue);
      return /interaction responsiveness|render-blocking|defer|async|javascript|main thread|slow server responses/.test(text);
    },
    build: (issue) =>
      buildRecommendation(
        'javascript-optimization',
        'performance',
        'Load less JavaScript on the critical path',
        `${issue.title} points to blocking scripts or too much main-thread work during the first interaction window, which directly hurts responsiveness and Core Web Vitals.`,
        'Move non-critical scripts off the critical path with defer or async, split heavy bundles, and lazy-load below-the-fold features only when they are needed.',
        [
          {
            framework: 'vanilla',
            title: 'Defer scripts and lazy-load heavy modules',
            language: 'html',
            code: `<!-- Keep analytics and non-critical code off the critical path -->
<script defer src="/js/app.js"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>

<script type="module">
  const pricingSection = document.querySelector('[data-pricing]');

  if (pricingSection) {
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;

      observer.disconnect();
      const { mountPricingCalculator } = await import('/js/pricing-calculator.js');
      mountPricingCalculator(pricingSection);
    });

    observer.observe(pricingSection);
  }
</script>`,
          },
          {
            framework: 'react',
            title: 'React lazy loading and route-level splitting',
            language: 'tsx',
            code: `import { Suspense, lazy } from 'react';

const PricingCalculator = lazy(() => import('./PricingCalculator'));

export function PricingSection() {
  return (
    <section>
      <h2>Pricing</h2>
      <Suspense fallback={<p>Loading calculator...</p>}>
        <PricingCalculator />
      </Suspense>
    </section>
  );
}`,
          },
          {
            framework: 'next',
            title: 'Next dynamic import for non-critical UI',
            language: 'tsx',
            code: `import dynamic from 'next/dynamic';

const PricingCalculator = dynamic(() => import('@/components/PricingCalculator'), {
  ssr: false,
  loading: () => <p>Loading calculator...</p>,
});

export default function PricingSection() {
  return (
    <section>
      <h2>Pricing</h2>
      <PricingCalculator />
    </section>
  );
}`,
          },
        ]
      ),
  },
  {
    id: 'css-optimization',
    category: 'performance',
    matches: (issue) => {
      const text = normalizeIssue(issue);
      return /render-blocking|css|styles|unused styles/.test(text);
    },
    build: (issue) =>
      buildRecommendation(
        'css-optimization',
        'performance',
        'Trim unused CSS and inline only the critical styles',
        `${issue.title} often means too much CSS is blocking the first paint or shipping styles that the current page never uses.`,
        'Minify the final CSS output, remove unused selectors during build, and inline only the small critical subset needed for above-the-fold rendering.',
        [
          {
            framework: 'vanilla',
            title: 'Load critical CSS first',
            language: 'html',
            code: `<!-- Inline only the small above-the-fold rules -->
<style>
  .hero { display: grid; gap: 1rem; padding: 2rem 1rem; }
  .hero__title { font-size: clamp(2rem, 6vw, 4rem); }
</style>

<!-- Load the full stylesheet asynchronously -->
<link
  rel="preload"
  href="/styles/site.min.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript><link rel="stylesheet" href="/styles/site.min.css" /></noscript>`,
          },
          {
            framework: 'react',
            title: 'Keep component CSS isolated',
            language: 'tsx',
            code: `import './hero.css';

export function Hero() {
  return (
    <section className="hero">
      <h1 className="hero__title">Ship faster pages</h1>
      <p className="hero__copy">Only load styles that this section actually needs.</p>
    </section>
  );
}

/* hero.css */
.hero {
  display: grid;
  gap: 1rem;
  padding: 2rem 1rem;
}

.hero__title {
  font-size: clamp(2rem, 6vw, 4rem);
}`,
          },
          {
            framework: 'next',
            title: 'Use CSS Modules for page-scoped styles',
            language: 'tsx',
            code: `import styles from './hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>Ship faster pages</h1>
      <p className={styles.copy}>Keep page CSS lean and component-scoped.</p>
    </section>
  );
}

/* hero.module.css */
.hero {
  display: grid;
  gap: 1rem;
  padding: 2rem 1rem;
}

.title {
  font-size: clamp(2rem, 6vw, 4rem);
}`,
          },
        ]
      ),
  },
  {
    id: 'meta-and-open-graph',
    category: 'seo',
    matches: (issue) => {
      const text = normalizeIssue(issue);
      return /meta description|title length|duplicate title|duplicate meta|open graph|og/.test(text);
    },
    build: (issue) =>
      buildRecommendation(
        'meta-and-open-graph',
        'seo',
        'Make metadata unique and social-preview ready',
        `${issue.title} shows search engines and social platforms are getting weak or duplicated page metadata, which reduces click-through rate and makes pages compete with each other.`,
        'Set unique titles and meta descriptions per page, then add Open Graph tags so the same intent and branding carry through search results, chat tools, and social shares.',
        [
          {
            framework: 'vanilla',
            title: 'Unique HTML metadata',
            language: 'html',
            code: `<head>
  <title>AI Chat Automation for Sales Teams | Jetmint AI</title>
  <meta
    name="description"
    content="Launch AI chat automation for sales teams with faster lead capture, better routing, and measurable conversion lift."
  />
  <meta property="og:title" content="AI Chat Automation for Sales Teams | Jetmint AI" />
  <meta
    property="og:description"
    content="Launch AI chat automation for sales teams with faster lead capture, better routing, and measurable conversion lift."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.example.com/ai-chat-automation" />
  <meta property="og:image" content="https://www.example.com/og/ai-chat-automation.jpg" />
</head>`,
          },
          {
            framework: 'react',
            title: 'React Helmet metadata',
            language: 'tsx',
            code: `import { Helmet } from 'react-helmet-async';

export function ServiceMeta() {
  return (
    <Helmet>
      <title>AI Chat Automation for Sales Teams | Jetmint AI</title>
      <meta
        name="description"
        content="Launch AI chat automation for sales teams with faster lead capture, better routing, and measurable conversion lift."
      />
      <meta property="og:title" content="AI Chat Automation for Sales Teams | Jetmint AI" />
      <meta
        property="og:description"
        content="Launch AI chat automation for sales teams with faster lead capture, better routing, and measurable conversion lift."
      />
      <meta property="og:image" content="https://www.example.com/og/ai-chat-automation.jpg" />
    </Helmet>
  );
}`,
          },
          {
            framework: 'next',
            title: 'Next.js metadata API',
            language: 'tsx',
            code: `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Chat Automation for Sales Teams | Jetmint AI',
  description:
    'Launch AI chat automation for sales teams with faster lead capture, better routing, and measurable conversion lift.',
  openGraph: {
    title: 'AI Chat Automation for Sales Teams | Jetmint AI',
    description:
      'Launch AI chat automation for sales teams with faster lead capture, better routing, and measurable conversion lift.',
    url: 'https://www.example.com/ai-chat-automation',
    images: ['https://www.example.com/og/ai-chat-automation.jpg'],
    type: 'website',
  },
};`,
          },
        ]
      ),
  },
  {
    id: 'canonical',
    category: 'technical',
    matches: (issue) => /canonical/i.test(issue.title) || /canonical/i.test(issue.fixGuide),
    build: (issue) =>
      buildRecommendation(
        'canonical',
        'technical',
        'Declare the preferred URL explicitly',
        `${issue.title} means search engines may be seeing multiple URLs as competing versions of the same page, which dilutes ranking signals and wastes crawl budget.`,
        'Add a self-referencing canonical on every indexable page and ensure filtered, duplicated, or campaign URLs point back to the primary URL.',
        [
          {
            framework: 'vanilla',
            title: 'Self-referencing canonical tag',
            language: 'html',
            code: `<head>
  <link rel="canonical" href="https://www.example.com/ai-chat-automation" />
</head>`,
          },
          {
            framework: 'react',
            title: 'Canonical tag with React Helmet',
            language: 'tsx',
            code: `import { Helmet } from 'react-helmet-async';

export function CanonicalTag() {
  return (
    <Helmet>
      <link rel="canonical" href="https://www.example.com/ai-chat-automation" />
    </Helmet>
  );
}`,
          },
          {
            framework: 'next',
            title: 'Canonical URL with Next metadata',
            language: 'tsx',
            code: `import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.example.com/ai-chat-automation',
  },
};`,
          },
        ]
      ),
  },
  {
    id: 'structured-data',
    category: 'schema',
    matches: (issue) => {
      const text = normalizeIssue(issue);
      return /json-ld|schema|breadcrumb|review|aggregaterating|article schema|localbusiness|organization/.test(text);
    },
    build: (issue) =>
      buildRecommendation(
        'structured-data',
        'schema',
        'Add JSON-LD that matches the page type',
        `${issue.title} tells search engines they are missing structured, machine-readable context about your brand, content, or offer. That limits rich-result eligibility and weakens entity understanding.`,
        'Publish valid JSON-LD close to the page intent: Organization or LocalBusiness on core pages, BreadcrumbList on navigational templates, and page-type schema like FAQPage, Article, Product, or Review where it truly applies.',
        [
          {
            framework: 'vanilla',
            title: 'Organization + service schema',
            language: 'html',
            code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Jetmint AI",
  "url": "https://www.example.com",
  "logo": "https://www.example.com/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/example"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "AI Chat Automation",
  "provider": {
    "@type": "Organization",
    "name": "Jetmint AI"
  },
  "areaServed": "Worldwide"
}
</script>`,
          },
          {
            framework: 'react',
            title: 'React JSON-LD component',
            language: 'tsx',
            code: `const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Jetmint AI',
  url: 'https://www.example.com',
  logo: 'https://www.example.com/logo.png',
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}`,
          },
          {
            framework: 'next',
            title: 'Next.js JSON-LD in a server component',
            language: 'tsx',
            code: `const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Jetmint AI',
  url: 'https://www.example.com',
  logo: 'https://www.example.com/logo.png',
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}`,
          },
        ]
      ),
  },
  {
    id: 'viewport',
    category: 'technical',
    matches: (issue) => /viewport/i.test(issue.title) || /viewport/i.test(issue.description),
    build: (issue) =>
      buildRecommendation(
        'viewport',
        'technical',
        'Set a mobile-friendly viewport baseline',
        `${issue.title} means browsers may not be scaling the page correctly on mobile devices, which can distort layouts and lower mobile usability scores.`,
        'Define a standard responsive viewport once per page document and combine it with fluid layouts, relative units, and responsive media.',
        [
          {
            framework: 'vanilla',
            title: 'Standard responsive viewport',
            language: 'html',
            code: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
          },
          {
            framework: 'react',
            title: 'Viewport metadata with React Helmet',
            language: 'tsx',
            code: `import { Helmet } from 'react-helmet-async';

export function ViewportMeta() {
  return (
    <Helmet>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>
  );
}`,
          },
          {
            framework: 'next',
            title: 'Next.js viewport export',
            language: 'tsx',
            code: `import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};`,
          },
        ]
      ),
  },
];

function buildFallbackRecommendation(issue: AuditIssue): IssueRecommendation {
  return buildRecommendation(
    'fallback',
    'technical',
    'Turn the fix guide into an implementation task',
    `${issue.title} needs a page-level implementation change rather than another generic checklist item. Start by applying the fix to one affected template, then reuse the same pattern across similar pages.`,
    issue.fixGuide,
    [
      {
        framework: 'vanilla',
        title: 'Vanilla rollout pattern',
        language: 'js',
        code: `// 1. Update the shared HTML template for affected pages
// 2. Verify the change in page source, not only the rendered DOM
// 3. Re-run the audit and compare before/after metrics

console.info('Apply the fix to one template, validate it, then roll it out site-wide.');`,
      },
      {
        framework: 'react',
        title: 'React rollout pattern',
        language: 'tsx',
        code: `export function TemplateFixChecklist() {
  return (
    <ol>
      <li>Patch the shared component or page layout that owns this issue.</li>
      <li>Confirm the rendered head markup and HTML output in the browser.</li>
      <li>Re-run the audit to verify the issue count drops.</li>
    </ol>
  );
}`,
      },
      {
        framework: 'next',
        title: 'Next.js rollout pattern',
        language: 'tsx',
        code: `export default function FixChecklist() {
  return (
    <section>
      <h2>Implementation checklist</h2>
      <ol>
        <li>Update the shared layout, metadata export, or server component.</li>
        <li>Check the server-rendered HTML in View Source.</li>
        <li>Re-run the audit and confirm the affected URL count falls.</li>
      </ol>
    </section>
  );
}`,
      },
    ]
  );
}

export function getIssueRecommendation(issue: AuditIssue): IssueRecommendation {
  const matchingRule = recommendationRules.find((rule) => rule.matches(issue));
  return matchingRule ? matchingRule.build(issue) : buildFallbackRecommendation(issue);
}
