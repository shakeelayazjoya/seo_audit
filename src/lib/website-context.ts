import type {
  AuditIssue,
  RecommendationFramework,
  RecommendationFrameworkMode,
  AIFixCodeContextFile,
} from '@/lib/types';

const REQUEST_TIMEOUT_MS = 8000;
const USER_AGENT =
  'SeoAuditBot/1.0 (+https://localhost:3000; website context retriever for AI fix recommendations)';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'have', 'into', 'what', 'when', 'where',
  'which', 'will', 'should', 'would', 'there', 'their', 'them', 'than', 'then', 'only', 'page', 'pages',
  'meta', 'title', 'issue', 'issues', 'warning', 'critical', 'opportunity', 'found', 'missing',
]);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s/_:-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function buildSearchTerms(issue: AuditIssue): string[] {
  return [...new Set(tokenize([issue.title, issue.description, issue.fixGuide].join(' ')))].slice(0, 16);
}

function detectFrameworkFromHtml(html: string, explicitFramework: RecommendationFrameworkMode): {
  framework: RecommendationFramework;
  reason: string;
} {
  if (explicitFramework !== 'auto') {
    return {
      framework: explicitFramework,
      reason: `Framework was explicitly selected as ${explicitFramework}.`,
    };
  }

  const normalized = html.toLowerCase();

  if (normalized.includes('__next') || normalized.includes('_next/') || normalized.includes('"next-head-count"')) {
    return {
      framework: 'next',
      reason: 'The page source includes Next.js markers such as __NEXT or _next assets.',
    };
  }

  if (
    normalized.includes('data-reactroot') ||
    normalized.includes('react') ||
    normalized.includes('id="root"') ||
    normalized.includes('id="app"')
  ) {
    return {
      framework: 'react',
      reason: 'The page source looks like a React-rendered application.',
    };
  }

  return {
    framework: 'vanilla',
    reason: 'The page source looks like standard server-rendered HTML without clear React or Next markers.',
  };
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*;q=0.8' },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) return '';
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) return '';

    return await response.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function scoreHtml(url: string, html: string, terms: string[]): number {
  const normalizedUrl = normalizeText(url);
  const normalizedHtml = normalizeText(html);

  return terms.reduce((score, term) => {
    const urlHits = normalizedUrl.includes(term) ? 6 : 0;
    const contentHits = normalizedHtml.split(term).length - 1;
    return score + urlHits + Math.min(contentHits, 10);
  }, 0);
}

function buildExcerpt(html: string, terms: string[]): {
  excerpt: string;
  startLine: number;
  endLine: number;
} {
  const lines = html.split(/\r?\n/);
  const matchIndex = lines.findIndex((line) => {
    const normalizedLine = normalizeText(line);
    return terms.some((term) => normalizedLine.includes(term));
  });

  if (matchIndex === -1) {
    return {
      excerpt: lines.slice(0, 80).join('\n').slice(0, 3500),
      startLine: 1,
      endLine: Math.min(lines.length, 80),
    };
  }

  const start = Math.max(0, matchIndex - 10);
  const end = Math.min(lines.length, matchIndex + 22);
  return {
    excerpt: lines.slice(start, end).join('\n').slice(0, 3500),
    startLine: start + 1,
    endLine: end,
  };
}

export async function retrieveWebsiteContext(input: {
  issue: AuditIssue;
  domain: string;
  framework: RecommendationFrameworkMode;
  limit?: number;
}): Promise<{
  framework: RecommendationFramework;
  frameworkReason: string;
  files: AIFixCodeContextFile[];
}> {
  const limit = input.limit ?? 3;
  const candidateUrls = Array.from(
    new Set(
      (input.issue.affectedUrls.length > 0 ? input.issue.affectedUrls : [`https://${input.domain}`]).slice(0, limit)
    )
  );

  const terms = buildSearchTerms(input.issue);
  const scoredResults: AIFixCodeContextFile[] = [];
  let detectedFramework: RecommendationFramework = input.framework === 'auto' ? 'vanilla' : input.framework;
  let frameworkReason =
    input.framework === 'auto'
      ? 'No JavaScript framework markers were confidently detected in the fetched HTML.'
      : `Framework was explicitly selected as ${input.framework}.`;

  for (const url of candidateUrls) {
    const html = await fetchHtml(url);
    if (!html) continue;

    const detection = detectFrameworkFromHtml(html, input.framework);
    if (input.framework === 'auto' && detection.framework !== 'vanilla') {
      detectedFramework = detection.framework;
      frameworkReason = detection.reason;
    }

    const score = scoreHtml(url, html, terms);
    const excerpt = buildExcerpt(html, terms);

    scoredResults.push({
      path: url,
      score,
      startLine: excerpt.startLine,
      endLine: excerpt.endLine,
      excerpt: excerpt.excerpt,
    });
  }

  if (input.framework === 'auto' && scoredResults.length > 0 && detectedFramework === 'vanilla') {
    const fallbackDetection = detectFrameworkFromHtml(scoredResults[0].excerpt, 'auto');
    detectedFramework = fallbackDetection.framework;
    frameworkReason = fallbackDetection.reason;
  }

  return {
    framework: detectedFramework,
    frameworkReason,
    files: scoredResults.sort((a, b) => b.score - a.score).slice(0, limit),
  };
}
