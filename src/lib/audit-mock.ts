// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuditIssue {
  severity: 'critical' | 'warning' | 'opportunity';
  title: string;
  description: string;
  affectedUrls: string[];
  fixGuide: string;
  impactScore: number;
  effortScore: number;
}

export interface ModuleResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: AuditIssue[];
  rawData: Record<string, unknown>;
}

export interface AuditModules {
  technical: ModuleResult;
  onPage: ModuleResult;
  performance: ModuleResult;
  cro: ModuleResult;
  localSeo: ModuleResult;
  aiSeo: ModuleResult;
  schema: ModuleResult;
}

// ─── Weights ─────────────────────────────────────────────────────────────────

const MODULE_WEIGHTS: Record<keyof AuditModules, number> = {
  technical: 0.25,
  onPage: 0.2,
  performance: 0.2,
  cro: 0.15,
  localSeo: 0.08,
  aiSeo: 0.07,
  schema: 0.05,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gradeFromScore(score: number): ModuleResult['grade'] {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function weightedScore(modules: AuditModules): number {
  let total = 0;
  for (const key of Object.keys(MODULE_WEIGHTS) as (keyof AuditModules)[]) {
    total += modules[key].score * MODULE_WEIGHTS[key];
  }
  return Math.round(total);
}

function url(path: string, domain: string): string {
  return `https://${domain}${path}`;
}

// ─── Mock generators per module ──────────────────────────────────────────────

function generateTechnical(domain: string): ModuleResult {
  const score = 72; // realistic mid-range score
  const issues: AuditIssue[] = [
    {
      severity: 'critical',
      title: 'Missing HTTPS redirect on HTTP pages',
      description:
        'Several pages are accessible via both HTTP and HTTPS without a proper 301 redirect. This creates duplicate content and security concerns for visitors.',
      affectedUrls: [url('/about', domain), url('/contact', domain), url('/blog', domain)],
      fixGuide:
        '1. Update your server configuration (nginx/Apache) to enforce HTTPS.\n2. Add a 301 redirect rule: RewriteEngine On → RewriteCond %{HTTPS} off → RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L].\n3. Update all internal links to use https://.\n4. Submit updated sitemap to Google Search Console.',
      impactScore: 9,
      effortScore: 3,
    },
    {
      severity: 'warning',
      title: 'Broken links detected (13 instances)',
      description:
        'Internal and external links returning 404 errors were found across the site. Broken links waste crawl budget and degrade user experience.',
      affectedUrls: [
        url('/services/old-offer', domain),
        url('/blog/post-deleted', domain),
        url('/products/discontinued-item', domain),
      ],
      fixGuide:
        '1. Run a full crawl using Screaming Frog or Ahrefs Site Audit.\n2. For internal 404s: restore the page, 301 redirect to the closest relevant page, or update all linking pages.\n3. For external 404s: remove the link or replace with an authoritative alternative.\n4. Set up monthly automated broken link monitoring.',
      impactScore: 7,
      effortScore: 5,
    },
    {
      severity: 'warning',
      title: 'Canonical tag inconsistencies',
      description:
        'Several pages are missing canonical tags or have self-referencing canonicals that don\'t match the preferred URL. This can lead to indexing issues with search engines.',
      affectedUrls: [url('/blog?page=2', domain), url('/products?sort=price', domain)],
      fixGuide:
        '1. Add <link rel="canonical" href="..."> to every page\'s <head>.\n2. Ensure paginated pages canonicalize to page 1 or use rel="prev"/"next".\n3. For filtered/sorted URLs, set canonical to the clean URL without parameters.\n4. Validate with Google Search Console\'s URL Inspection tool.',
      impactScore: 6,
      effortScore: 4,
    },
    {
      severity: 'opportunity',
      title: 'Robots.txt could be optimized',
      description:
        'The robots.txt file is present but doesn\'t block unnecessary crawl paths. Administrative and search-result pages are still being crawled, wasting crawl budget.',
      affectedUrls: [url('/robots.txt', domain)],
      fixGuide:
        '1. Add Disallow rules for: /admin/, /search/, /wp-admin/, /cart/, /checkout/, /*?sort=, /*?filter=.\n2. Add your sitemap URL: Sitemap: https://' + domain + '/sitemap.xml.\n3. Test with Google\'s robots.txt Tester.\n4. Monitor crawl stats in Search Console after changes.',
      impactScore: 4,
      effortScore: 2,
    },
  ];

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      totalUrlsCrawled: 847,
      httpsScore: 65,
      redirectChains: 12,
      brokenLinks: 13,
      canonicalIssues: 7,
      robotsTxtPresent: true,
      sitemapPresent: true,
      sitemapUrlCount: 312,
      crawlDepth: { max: 6, avg: 3.2, recommended: 4 },
      indexedPages: 289,
      orphanPages: 34,
    },
  };
}

function generateOnPage(domain: string): ModuleResult {
  const score = 58;
  const issues: AuditIssue[] = [
    {
      severity: 'critical',
      title: 'Duplicate title tags on 23 pages',
      description:
        'Multiple pages share identical title tags, making it difficult for search engines to differentiate between them. This dilutes click-through rates and ranking potential.',
      affectedUrls: [
        url('/blog/post-1', domain),
        url('/blog/post-2', domain),
        url('/blog/post-3', domain),
      ],
      fixGuide:
        '1. Audit all title tags using Screaming Frog or Sitebulb.\n2. Ensure every page has a unique, descriptive title (50-60 characters).\n3. Include primary keyword near the beginning.\n4. Add brand name at the end: "Page Title | Brand".\n5. Use a CMS template that auto-generates titles from H1 + brand suffix.',
      impactScore: 9,
      effortScore: 4,
    },
    {
      severity: 'critical',
      title: 'Missing or empty meta descriptions on 41 pages',
      description:
        'A significant portion of pages lack meta descriptions. Search engines will auto-generate snippets, which often results in lower click-through rates from search results.',
      affectedUrls: [
        url('/services', domain),
        url('/about', domain),
        url('/faq', domain),
      ],
      fixGuide:
        '1. Identify all pages missing meta descriptions.\n2. Write unique descriptions (150-160 characters) that include a call-to-action.\n3. Match search intent: informational pages get descriptive summaries; transactional pages get benefit-driven copy.\n4. Use structured data to potentially earn rich snippets instead.',
      impactScore: 8,
      effortScore: 5,
    },
    {
      severity: 'warning',
      title: 'Multiple H1 tags on 18 pages',
      description:
        'Best practice is one H1 per page that describes the main topic. Multiple H1 tags confuse content hierarchy and may dilute topical relevance signals.',
      affectedUrls: [url('/services/web-design', domain), url('/products', domain)],
      fixGuide:
        '1. Restructure pages to use a single H1 containing the primary keyword.\n2. Demote secondary headings to H2, H3, etc.\n3. Ensure heading hierarchy is logical (H1 → H2 → H3, no skipping).\n4. Update any CMS templates that generate multiple H1 elements.',
      impactScore: 6,
      effortScore: 3,
    },
    {
      severity: 'warning',
      title: 'Thin content detected on 15 pages',
      description:
        'Pages with fewer than 300 words of main content were identified. Thin content often underperforms in search results and may be flagged as low-quality by algorithms.',
      affectedUrls: [
        url('/services/consulting', domain),
        url('/locations/chicago', domain),
        url('/industries/retail', domain),
      ],
      fixGuide:
        '1. Identify all thin content pages.\n2. Expand content with relevant, in-depth information (aim for 800+ words for main pages).\n3. Add FAQs, case studies, or customer testimonials.\n4. Consider consolidating similar thin pages into comprehensive guides.\n5. For location pages, add local-specific content and testimonials.',
      impactScore: 7,
      effortScore: 6,
    },
    {
      severity: 'opportunity',
      title: 'Missing Open Graph tags on 67% of pages',
      description:
        'Open Graph (OG) tags improve how content appears when shared on social media. Pages without OG tags rely on default previews, reducing social engagement.',
      affectedUrls: [url('/blog', domain), url('/case-studies', domain)],
      fixGuide:
        '1. Add OG tags to all page templates: og:title, og:description, og:image, og:url, og:type.\n2. Ensure og:image is at least 1200x630px for optimal display.\n3. Add Twitter Card meta tags (twitter:card, twitter:title, twitter:image).\n4. Use a tool like HeyMeta or Facebook Sharing Debugger to validate.',
      impactScore: 4,
      effortScore: 3,
    },
  ];

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      totalPages: 847,
      pagesWithUniqueTitles: 824,
      pagesWithMetaDesc: 806,
      pagesWithH1: 829,
      pagesWithMultipleH1: 18,
      avgWordCount: 412,
      thinContentPages: 15,
      pagesWithOgTags: 279,
      pagesWithTwitterCards: 142,
      keywordInTitleRate: 0.68,
      keywordInH1Rate: 0.72,
      keywordInFirstParagraphRate: 0.54,
    },
  };
}

function generatePerformance(domain: string): ModuleResult {
  const score = 64;
  const issues: AuditIssue[] = [
    {
      severity: 'critical',
      title: 'Largest Contentful Paint (LCP) exceeds 4.0s threshold',
      description:
        'LCP measures loading performance. Your LCP of 4.2s significantly exceeds the "good" threshold of 2.5s, causing poor user experience and potential ranking penalties in Google\'s Core Web Vitals.',
      affectedUrls: [url('/', domain), url('/services', domain), url('/blog', domain)],
      fixGuide:
        '1. Identify the LCP element (usually a hero image or text block).\n2. Optimize the LCP image: use WebP/AVIF format, compress to <100KB, add width/height attributes.\n3. Preload the LCP resource: <link rel="preload" href="hero.webp" as="image">.\n4. Use a CDN to reduce server response time.\n5. Consider using a next-gen image format with <picture> element.\n6. Eliminate render-blocking resources in the critical path.',
      impactScore: 9,
      effortScore: 6,
    },
    {
      severity: 'warning',
      title: 'Interaction to Next Paint (INP) at 320ms needs improvement',
      description:
        'INP replaces FID and measures overall responsiveness. Your 320ms INP is above the "good" threshold of 200ms, indicating sluggish interactions.',
      affectedUrls: [url('/products', domain), url('/pricing', domain)],
      fixGuide:
        '1. Identify slow event handlers using Chrome DevTools Performance panel.\n2. Break up long tasks (>50ms) using requestAnimationFrame or setTimeout.\n3. Minimize main thread work: defer non-critical JS, use web workers for heavy computation.\n4. Reduce CSS complexity that triggers expensive reflows.\n5. Use event delegation instead of attaching many individual listeners.\n6. Consider implementing optimistic UI updates for perceived performance.',
      impactScore: 7,
      effortScore: 7,
    },
    {
      severity: 'warning',
      title: 'Cumulative Layout Shift (CLS) of 0.28 is poor',
      description:
        'CLS measures visual stability. A score of 0.28 is well above the 0.1 threshold, meaning elements shift unexpectedly as the page loads, frustrating users.',
      affectedUrls: [url('/', domain), url('/blog/post-featured', domain)],
      fixGuide:
        '1. Add explicit width and height dimensions to all images and videos.\n2. Reserve space for dynamic content (ads, embeds) using CSS aspect-ratio or container queries.\n3. Use font-display: swap and preload web fonts to prevent FOIT/FOUT shifts.\n4. Avoid inserting content above existing content (e.g., banners, notifications).\n5. Use CSS contain: layout on animated elements.\n6. Test in Lighthouse and Chrome UX Report.',
      impactScore: 8,
      effortScore: 5,
    },
    {
      severity: 'opportunity',
      title: 'Time to First Byte (TTFB) can be optimized from 820ms to under 400ms',
      description:
        'TTFB measures server responsiveness. At 820ms, your server takes too long to start sending content. This cascades into all other performance metrics.',
      affectedUrls: [url('/', domain), url('/api/', domain)],
      fixGuide:
        '1. Enable server-side caching (Redis/Varnish) for dynamic content.\n2. Use a CDN to cache static assets at edge locations.\n3. Optimize database queries and add proper indexing.\n4. Enable HTTP/2 or HTTP/3 for multiplexed connections.\n5. Consider edge computing or serverless functions for API routes.\n6. Implement stale-while-revalidate caching strategies.',
      impactScore: 6,
      effortScore: 6,
    },
  ];

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      lcp: { value: 4200, unit: 'ms', rating: 'poor' },
      inp: { value: 320, unit: 'ms', rating: 'needs-improvement' },
      cls: { value: 0.28, rating: 'poor' },
      fcp: { value: 2400, unit: 'ms', rating: 'needs-improvement' },
      ttfb: { value: 820, unit: 'ms', rating: 'needs-improvement' },
      totalPageSize: { value: 3.2, unit: 'MB', pages: [url('/', domain), url('/services', domain)] },
      jsBundleSize: { value: 487, unit: 'KB' },
      cssSize: { value: 124, unit: 'KB' },
      imageOptimizationRate: 0.42,
      renderBlockingResources: 8,
      thirdPartyScripts: 11,
      lighthouseScore: { mobile: 52, desktop: 78 },
    },
  };
}

function generateCRO(domain: string): ModuleResult {
  const score = 55;
  const issues: AuditIssue[] = [
    {
      severity: 'critical',
      title: 'No primary CTA visible above the fold on key landing pages',
      description:
        'The main landing pages lack a clear, prominent call-to-action (CTA) visible without scrolling. Visitors must hunt for the next step, leading to high bounce rates.',
      affectedUrls: [url('/', domain), url('/services', domain), url('/about', domain)],
      fixGuide:
        '1. Place a high-contrast CTA button above the fold on every key landing page.\n2. Use action-oriented copy: "Get Your Free Audit", "Start Your Trial", "Schedule a Call".\n3. Make the CTA visually prominent: contrasting color, larger size, whitespace around it.\n4. Add a secondary CTA for visitors not ready to convert.\n5. A/B test CTA placement, color, and copy.\n6. Ensure CTAs are visible on mobile without horizontal scrolling.',
      impactScore: 9,
      effortScore: 3,
    },
    {
      severity: 'warning',
      title: 'Contact form has 12 fields — high friction expected',
      description:
        'The main contact/lead form requests 12 fields. Research shows forms with 3-5 fields have the highest conversion rates. Each additional field reduces submissions by ~5-10%.',
      affectedUrls: [url('/contact', domain), url('/get-started', domain)],
      fixGuide:
        '1. Reduce form to essential fields: Name, Email, and one qualifying question.\n2. Move non-essential fields to a progressive profiling strategy (ask later).\n3. Use smart defaults and autofill where possible.\n4. Add inline validation (not just on submit).\n5. Show a clear value proposition next to the form ("What you get").\n6. Add social proof (testimonials, logos) near the form.',
      impactScore: 8,
      effortScore: 4,
    },
    {
      severity: 'warning',
      title: 'Missing trust signals on conversion pages',
      description:
        'Key conversion pages lack trust indicators like testimonials, certifications, client logos, or security badges. Visitors need social proof to feel confident converting.',
      affectedUrls: [url('/pricing', domain), url('/services', domain)],
      fixGuide:
        '1. Add client logos above the fold on key pages.\n2. Include 3-5 testimonials with real names and photos near CTAs.\n3. Display trust badges: SSL, industry certifications, awards.\n4. Add a live chat widget for instant support.\n5. Show number of customers served or projects completed.\n6. Include a "Featured in" media bar if applicable.',
      impactScore: 7,
      effortScore: 4,
    },
    {
      severity: 'opportunity',
      title: 'Mobile usability issues on 8 pages',
      description:
        'Several pages have tap targets that are too small (<44px), text that requires horizontal scrolling, or viewport configuration errors, creating friction for mobile users who make up 65% of traffic.',
      affectedUrls: [
        url('/products', domain),
        url('/blog', domain),
        url('/services/enterprise', domain),
      ],
      fixGuide:
        '1. Ensure all tap targets are at least 44x44px with adequate spacing.\n2. Set viewport meta tag correctly: <meta name="viewport" content="width=device-width, initial-scale=1">.\n3. Use responsive font sizes (clamp() or media queries).\n4. Test on real devices using BrowserStack or Device Lab.\n5. Avoid horizontal scroll on any viewport size.\n6. Use Google\'s Mobile-Friendly Test tool for validation.',
      impactScore: 7,
      effortScore: 5,
    },
    {
      severity: 'opportunity',
      title: 'No urgency or scarcity elements detected',
      description:
        'Conversion pages lack urgency cues (limited-time offers, countdown timers, limited spots) or scarcity signals that can boost conversion rates by 10-30%.',
      affectedUrls: [url('/pricing', domain), url('/services', domain)],
      fixGuide:
        '1. Add a countdown timer for time-limited offers.\n2. Show limited availability ("Only 3 spots left this month").\n3. Display real-time social proof ("5 people signed up today").\n4. Use progress bars for tiered pricing limits.\n5. A/B test different urgency elements to find what works.\n6. Keep urgency authentic — fake urgency damages trust long-term.',
      impactScore: 5,
      effortScore: 3,
    },
  ];

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      ctaAboveFoldRate: 0.25,
      avgFormFields: 12,
      trustSignalsPerConversionPage: 0.5,
      mobileUsabilityScore: 71,
      pageSpeedImpactOnConversion: 'high',
      heatmapData: { topClickedElement: 'logo', lowestScrollDepth: '62%', highestDropOff: 'above-fold' },
      trafficShare: { mobile: 0.65, desktop: 0.35 },
      estimatedConversionRate: 1.8,
    },
  };
}

function generateLocalSeo(domain: string): ModuleResult {
  const score = 43;
  const issues: AuditIssue[] = [
    {
      severity: 'critical',
      title: 'NAP inconsistency across directories',
      description:
        'Your business Name, Address, and Phone (NAP) information differs across 5 online directories. Inconsistent NAP data confuses search engines and can lead to lower local rankings.',
      affectedUrls: [
        'https://yelp.com/biz/' + domain,
        'https://yellowpages.com/' + domain,
        'https://bbb.org/' + domain,
      ],
      fixGuide:
        '1. Establish one authoritative NAP format and use it everywhere.\n2. Audit all directory listings: Google Business Profile, Yelp, BBB, YellowPages, Facebook, Apple Maps.\n3. Submit corrections to each directory individually.\n4. Use a tool like BrightLocal, Yext, or Whitespark for bulk management.\n5. Set up monitoring to catch future inconsistencies.\n6. Ensure your website footer matches the NAP exactly.',
      impactScore: 9,
      effortScore: 5,
    },
    {
      severity: 'critical',
      title: 'No LocalBusiness structured data found',
      description:
        'The site lacks LocalBusiness JSON-LD markup. Without it, Google cannot display rich local results like business hours, address, and reviews in local search results.',
      affectedUrls: [url('/', domain), url('/contact', domain)],
      fixGuide:
        '1. Add LocalBusiness JSON-LD to your homepage and contact page.\n2. Include: name, address, phone, openingHours, geo coordinates, URL.\n3. Use Google\'s Structured Data Markup Helper to generate the code.\n4. Validate with Google\'s Rich Results Test and Schema.org validator.\n5. Consider adding Review and AggregateRating markup if you have reviews.\n6. Add AreaServed and priceRange if applicable.',
      impactScore: 8,
      effortScore: 3,
    },
    {
      severity: 'warning',
      title: 'Location pages lack unique content',
      description:
        'Multiple location pages share boilerplate content with only the city name swapped. Google treats near-duplicate location pages as doorway pages, which can trigger a penalty.',
      affectedUrls: [
        url('/locations/new-york', domain),
        url('/locations/los-angeles', domain),
        url('/locations/chicago', domain),
      ],
      fixGuide:
        '1. Write unique content for each location page (at least 500 words).\n2. Include local-specific information: directions, nearby landmarks, local testimonials.\n3. Add photos of the actual location.\n4. Embed a Google Map with the correct pin.\n5. Add local schema markup with the specific address.\n6. Interlink location pages with relevant service pages.',
      impactScore: 7,
      effortScore: 7,
    },
    {
      severity: 'opportunity',
      title: 'Google Business Profile incomplete',
      description:
        'Your Google Business Profile is missing business hours, holiday hours, service categories, photos, and Q&A. A complete profile gets 7x more clicks than an incomplete one.',
      affectedUrls: ['https://business.google.com/' + domain],
      fixGuide:
        '1. Fill out all profile fields completely.\n2. Add business hours, including special holiday hours.\n3. Select all relevant primary and secondary categories.\n4. Upload at least 20 high-quality photos.\n5. Add services with descriptions and pricing.\n6. Create and respond to Q&A.\n7. Post weekly Google Business updates.',
      impactScore: 7,
      effortScore: 4,
    },
  ];

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      napConsistency: { consistent: 12, inconsistent: 5, directories: 17 },
      googleBusinessProfileComplete: false,
      localBusinessSchema: false,
      locationPageCount: 8,
      locationPageUnique: 3,
      googleReviews: { count: 47, avgRating: 4.1 },
      mapEmbedPresent: true,
      localKeywordsTracking: 23,
      localPackAppearances: 5,
    },
  };
}

function generateAiSeo(domain: string): ModuleResult {
  const score = 68;
  const issues: AuditIssue[] = [
    {
      severity: 'warning',
      title: 'No author bios or E-E-A-T signals on content pages',
      description:
        'Blog posts and articles lack author bios, credentials, and expertise indicators. Google\'s helpful content updates and quality rater guidelines emphasize E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).',
      affectedUrls: [url('/blog', domain), url('/resources/guides', domain)],
      fixGuide:
        '1. Create author profile pages with credentials, experience, and links to social profiles.\n2. Add author schema markup (Person) to every article.\n3. Include "Written by" and "Reviewed by" attributions.\n4. Link author names to their profile pages.\n5. Add "About the Author" sections to long-form content.\n6. Show author expertise: certifications, publications, years of experience.',
      impactScore: 8,
      effortScore: 5,
    },
    {
      severity: 'warning',
      title: 'Lack of source citations in long-form content',
      description:
        'Articles exceeding 1,500 words rarely cite external sources or include outbound links to authoritative references. Citations improve credibility and align with Google\'s preference for well-researched content.',
      affectedUrls: [
        url('/blog/ultimate-guide-seo-2024', domain),
        url('/resources/keyword-research-guide', domain),
      ],
      fixGuide:
        '1. Add 3-5 outbound links per long-form article to authoritative sources (.gov, .edu, established publications).\n2. Use inline citations with proper attribution.\n3. Create a "Sources" or "References" section at the end of articles.\n4. Link to original studies, statistics, and official documentation.\n5. Ensure outbound links open in new tabs and use rel="noopener".\n6. Regularly audit outbound links to ensure they\'re not broken.',
      impactScore: 6,
      effortScore: 3,
    },
    {
      severity: 'opportunity',
      title: 'Content not organized into topical clusters',
      description:
        'Content exists as standalone articles without internal linking to related topics. Topical clusters demonstrate comprehensive authority on a subject and improve crawl efficiency.',
      affectedUrls: [url('/blog', domain)],
      fixGuide:
        '1. Identify 5-8 core topics your business wants to rank for (pillar pages).\n2. Map existing content to these pillars.\n3. Create pillar pages (3,000+ words) for each core topic.\n4. Link all related articles back to the pillar page.\n5. Add a "Related Articles" section to each post.\n6. Plan new content to fill gaps in each cluster.\n7. Use internal linking tools like Link Whisper or ContentKing.',
      impactScore: 7,
      effortScore: 8,
    },
    {
      severity: 'opportunity',
      title: 'Content freshness: 31% of pages not updated in 12+ months',
      description:
        'Nearly a third of your content pages haven\'t been updated in over a year. Fresh content signals relevance to Google and can improve rankings for queries requiring current information.',
      affectedUrls: [url('/blog/seo-trends-2022', domain), url('/blog/link-building-guide', domain)],
      fixGuide:
        '1. Run a content audit to identify stale pages (last modified > 12 months ago).\n2. Prioritize high-traffic pages and those ranking on page 2.\n3. Update statistics, add new sections, refresh screenshots.\n4. Change the "last updated" date in the page.\n5. Set up a quarterly content refresh calendar.\n6. For evergreen content, add a "Updated for 2024" badge.',
      impactScore: 5,
      effortScore: 5,
    },
  ];

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      authorBiosPresent: false,
      eeatSignals: { experience: 0.3, expertise: 0.5, authoritativeness: 0.6, trustworthiness: 0.7 },
      avgCitationsPerArticle: 0.4,
      articlesWithCitations: 0.22,
      topicalClusters: 0,
      contentFreshness: { updatedIn6Months: 0.42, updatedIn12Months: 0.69, olderThan12Months: 0.31 },
      avgContentAge: '14 months',
      aiDetectionRisk: 'low',
    },
  };
}

function generateSchema(domain: string): ModuleResult {
  const score = 35;
  const issues: AuditIssue[] = [
    {
      severity: 'critical',
      title: 'No structured data markup found on any page',
      description:
        'The entire site lacks JSON-LD structured data. Schema markup helps search engines understand your content and enables rich results (star ratings, FAQs, breadcrumbs) that significantly increase CTR.',
      affectedUrls: [url('/', domain), url('/blog', domain), url('/products', domain)],
      fixGuide:
        '1. Start with Organization schema on your homepage (JSON-LD in <head>).\n2. Add BreadcrumbList schema to all interior pages.\n3. Add Article schema to all blog posts with author, datePublished, image.\n4. Add FAQ schema to FAQ pages (must use actual FAQPage format).\n5. Add Product schema with offers/pricing to product pages.\n6. Validate all markup at schema.org validator and Google Rich Results Test.',
      impactScore: 9,
      effortScore: 6,
    },
    {
      severity: 'warning',
      title: 'No FAQ schema on content-rich pages',
      description:
        'Pages with Q&A sections or frequently asked questions don\'t use FAQPage structured data. FAQ rich results can occupy more SERP real estate and provide direct answers in search results.',
      affectedUrls: [url('/faq', domain), url('/services/web-design', domain)],
      fixGuide:
        '1. Identify pages with existing Q&A content.\n2. Wrap questions/answers in FAQPage JSON-LD format.\n3. Each question needs "name" and "acceptedAnswer" (text) fields.\n4. Ensure answers are comprehensive (40-50 words minimum).\n5. Don\'t add FAQ schema to pages without real Q&A content (Google may ignore it).\n6. Test in Rich Results Test and monitor Search Console for errors.',
      impactScore: 7,
      effortScore: 3,
    },
    {
      severity: 'warning',
      title: 'No Article schema on blog posts',
      description:
        'Blog posts lack Article structured data, missing the opportunity for rich article results in Google Search including headline, image, date, and author information.',
      affectedUrls: [url('/blog', domain)],
      fixGuide:
        '1. Add Article JSON-LD to all blog post templates.\n2. Required fields: headline, image, author, datePublished, publisher.\n3. Use "Article" type for standard posts, "TechArticle" for technical content.\n4. Include dateModified when updating content.\n5. Add mainEntityOfPage pointing to the article URL.\n6. Use publisher.logo with a square image (at least 112x112px).',
      impactScore: 6,
      effortScore: 3,
    },
    {
      severity: 'opportunity',
      title: 'Could benefit from VideoObject schema',
      description:
        'Pages with embedded videos don\'t include VideoObject schema, missing the chance for video rich results with thumbnails and play buttons in search results.',
      affectedUrls: [url('/resources/tutorials', domain), url('/about', domain)],
      fixGuide:
        '1. Add VideoObject JSON-LD to pages with embedded videos.\n2. Include: name, description, thumbnailUrl, uploadDate, duration, contentUrl.\n3. Provide a high-quality thumbnail (at least 720p).\n4. Add isFamilyFriendly: true if appropriate.\n5. If using YouTube, you can test with the Video structured data report in Search Console.',
      impactScore: 4,
      effortScore: 4,
    },
  ];

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      pagesWithAnySchema: 0,
      pagesWithOrganization: 0,
      pagesWithBreadcrumb: 0,
      pagesWithArticle: 0,
      pagesWithFaq: 0,
      pagesWithProduct: 0,
      pagesWithLocalBusiness: 0,
      schemaValidation: { valid: 0, errors: 0, warnings: 0 },
      eligibleForRichResults: ['FAQ', 'Article', 'Breadcrumb', 'Organization'],
      currentlyEarningRichResults: [],
    },
  };
}

// ─── Main generator ──────────────────────────────────────────────────────────

export function generateAuditModules(domain: string): AuditModules {
  const modules: AuditModules = {
    technical: generateTechnical(domain),
    onPage: generateOnPage(domain),
    performance: generatePerformance(domain),
    cro: generateCRO(domain),
    localSeo: generateLocalSeo(domain),
    aiSeo: generateAiSeo(domain),
    schema: generateSchema(domain),
  };
  return modules;
}

export function calculateOverallScore(modules: AuditModules): number {
  return weightedScore(modules);
}

export { MODULE_WEIGHTS };
