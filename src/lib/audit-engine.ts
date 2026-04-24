import * as cheerio from 'cheerio';
import {
  analyzeRuntimePerformance,
  renderHtmlWithPlaywright,
  type RuntimePerformanceMetrics,
} from './performance-analysis.ts';
import { fetchSearchConsoleSnapshot, type SearchConsoleSnapshot } from './search-console.ts';

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

interface FetchResult {
  url: string;
  status: number;
  ok: boolean;
  contentType: string;
  html: string;
  responseTimeMs: number;
  contentLength: number | null;
  headers: Headers;
  redirectChain: string[];
}

interface PageSnapshot {
  url: string;
  depth: number;
  status: number;
  redirectChainLength: number;
  responseTimeMs: number;
  contentLength: number | null;
  title: string;
  metaDescription: string;
  metaRobots: string;
  canonical: string | null;
  h1s: string[];
  headingLevels: number[];
  wordCount: number;
  internalLinks: string[];
  externalLinks: string[];
  imagesMissingAlt: string[];
  genericAltImages: string[];
  lazyLoadedImages: number;
  imageCount: number;
  openGraphMissing: string[];
  twitterCardMissing: boolean;
  viewportMissing: boolean;
  forms: number;
  formFieldCount: number;
  hasPrimaryCta: boolean;
  ctaAboveFold: boolean;
  trustSignals: number;
  socialProofSignals: number;
  schemaTypes: string[];
  hasLocalBusinessSchema: boolean;
  hasAuthorSignal: boolean;
  keywordTerms: string[];
  citationCount: number;
  textSample: string;
  hasNoindex: boolean;
  hasNofollow: boolean;
  hasMapEmbed: boolean;
  hasPhone: boolean;
  hasAddress: boolean;
  hasEmail: boolean;
  faqQuestionCount: number;
  localKeywordHits: number;
  lastModified: string | null;
  scripts: string[];
  stylesheets: string[];
  pageSizeBytes: number;
}

interface CrawlResult {
  domain: string;
  origin: string;
  pages: PageSnapshot[];
  robotsTxtPresent: boolean;
  sitemapPresent: boolean;
  sitemapUrls: string[];
  robotsDirectives: string[];
  httpsRedirects: boolean;
  llmsTxtPresent: boolean;
  runtimePerformance: RuntimePerformanceMetrics;
  searchConsole: SearchConsoleSnapshot;
  errors: string[];
}

const MODULE_WEIGHTS: Record<keyof AuditModules, number> = {
  technical: 0.25,
  onPage: 0.2,
  performance: 0.2,
  cro: 0.15,
  localSeo: 0.08,
  aiSeo: 0.07,
  schema: 0.05,
};

const MAX_PAGES = 40;
const MAX_DEPTH = 4;
const MAX_RENDERED_PAGES = 3;
const MAX_SITEMAP_DISCOVERY = 60;
const REQUEST_TIMEOUT_MS = 8000;
const CRAWL_TIME_BUDGET_MS = 90000;
const USER_AGENT =
  'SeoAuditBot/1.0 (+https://localhost:3000; production-grade site audit crawler)';

function gradeFromScore(score: number): ModuleResult['grade'] {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function weightedScore(modules: AuditModules): number {
  let total = 0;
  for (const key of Object.keys(MODULE_WEIGHTS) as (keyof AuditModules)[]) {
    total += modules[key].score * MODULE_WEIGHTS[key];
  }
  return Math.round(total);
}

function normalizeDomainInput(input: string): string {
  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const url = new URL(withProtocol);
  return url.hostname.replace(/^www\./i, '').toLowerCase();
}

function normalizeUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.hash = '';
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function createTextSignature(value: string): string {
  return normalizeText(value).split(' ').slice(0, 80).join(' ');
}

function countMatches(text: string, terms: string[]): number {
  if (!text || terms.length === 0) return 0;
  const haystack = normalizeText(text);
  return terms.reduce((total, term) => {
    const needle = normalizeText(term);
    if (!needle) return total;
    return total + (haystack.includes(needle) ? 1 : 0);
  }, 0);
}

function extractKeywordTerms(title: string, pathname: string): string[] {
  const source = [title, pathname.replace(/[\/_-]+/g, ' ')].join(' ');
  const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'our', 'page', 'home']);
  return unique(
    normalizeText(source)
      .split(' ')
      .filter((term) => term.length > 2 && !stopWords.has(term))
      .slice(0, 6)
  );
}

function extractHeadingLevels($: cheerio.CheerioAPI): number[] {
  return $('h1, h2, h3, h4, h5, h6')
    .map((_, el) => Number((el.tagName || '').replace('h', '')))
    .get()
    .filter((value) => Number.isFinite(value));
}

function hasValidHeadingHierarchy(levels: number[]): boolean {
  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index] - levels[index - 1] > 1) return false;
  }
  return true;
}

function buildInboundLinkMap(pages: PageSnapshot[]): Map<string, number> {
  const inbound = new Map<string, number>();
  for (const page of pages) {
    inbound.set(page.url, inbound.get(page.url) ?? 0);
  }

  for (const page of pages) {
    for (const link of page.internalLinks) {
      inbound.set(link, (inbound.get(link) ?? 0) + 1);
    }
  }

  return inbound;
}

function tokenizeWords(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((term) => term.length > 2);
}

function looksGenericAlt(alt: string): boolean {
  return /\b(image|photo|graphic|img|banner|screenshot)\b/i.test(alt.trim());
}

function isLikelyClientRendered(html: string): boolean {
  const bodyText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const visibleText = bodyText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const scriptCount = (html.match(/<script/gi) ?? []).length;
  return visibleText.length < 220 && scriptCount >= 5;
}

function getOriginVariants(domain: string) {
  const bare = domain.toLowerCase();
  return {
    https: `https://${bare}`,
    httpsWww: `https://www.${bare}`,
    http: `http://${bare}`,
    bare,
  };
}

async function fetchWithTiming(url: string): Promise<FetchResult> {
  const started = Date.now();
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': USER_AGENT,
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,text/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const responseTimeMs = Date.now() - started;
  const contentType = response.headers.get('content-type') ?? '';
  const html = await response.text();
  const lengthHeader = response.headers.get('content-length');
  const contentLength = lengthHeader ? Number(lengthHeader) : Buffer.byteLength(html, 'utf8');
  const normalizedRequestedUrl = normalizeUrl(url);
  const normalizedFinalUrl = normalizeUrl(response.url);
  const redirectChain =
    response.redirected && normalizedRequestedUrl !== normalizedFinalUrl
      ? [normalizedRequestedUrl, normalizedFinalUrl]
      : [normalizedFinalUrl];

  return {
    url: response.url,
    status: response.status,
    ok: response.ok,
    contentType,
    html,
    responseTimeMs,
    contentLength: Number.isFinite(contentLength) ? contentLength : null,
    headers: response.headers,
    redirectChain,
  };
}

async function tryFetch(url: string): Promise<FetchResult | null> {
  try {
    return await fetchWithTiming(url);
  } catch {
    return null;
  }
}

function extractSitemapUrls(xml: string): string[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls: string[] = [];
  $('url > loc, sitemap > loc').each((_, el) => {
    const value = $(el).text().trim();
    if (value) urls.push(value);
  });
  return unique(urls);
}

async function discoverSitemaps(origin: string, robotsTxt: string): Promise<string[]> {
  const candidates = new Set<string>([
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap-index.xml`,
  ]);

  for (const line of robotsTxt.split(/\r?\n/)) {
    const match = line.match(/^sitemap:\s*(.+)$/i);
    if (match?.[1]) {
      candidates.add(match[1].trim());
    }
  }

  const discovered = new Set<string>();
  const queue = [...candidates];
  const seen = new Set<string>();

  while (queue.length > 0 && discovered.size < MAX_SITEMAP_DISCOVERY) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    const res = await tryFetch(current);
    if (!res || !res.ok || !/xml|text/i.test(res.contentType)) continue;

    discovered.add(current);
    for (const next of extractSitemapUrls(res.html)) {
      if (next.endsWith('.xml') || next.includes('sitemap')) {
        if (!seen.has(next)) queue.push(next);
      } else {
        discovered.add(next);
      }
    }
  }

  return [...discovered];
}

function matchesDomain(hostname: string, domain: string): boolean {
  const normalized = hostname.replace(/^www\./i, '').toLowerCase();
  return normalized === domain || normalized.endsWith(`.${domain}`);
}

function textContent($: cheerio.CheerioAPI, selector: string): string {
  return $(selector)
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join(' ');
}

function countWords(text: string): number {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;
}

function parseSchemaTypes(rawValue: unknown): string[] {
  const types: string[] = [];

  const walk = (value: unknown) => {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    const record = value as Record<string, unknown>;
    const typeValue = record['@type'];
    if (typeof typeValue === 'string') {
      types.push(typeValue);
    } else if (Array.isArray(typeValue)) {
      for (const entry of typeValue) {
        if (typeof entry === 'string') types.push(entry);
      }
    }

    for (const nested of Object.values(record)) {
      walk(nested);
    }
  };

  walk(rawValue);
  return unique(types);
}

function extractJsonLdTypes($: cheerio.CheerioAPI): string[] {
  const types: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      types.push(...parseSchemaTypes(parsed));
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  });
  return unique(types);
}

function pickPrimaryText($: cheerio.CheerioAPI): string {
  const selectors = ['main', 'article', '[role="main"]', 'body'];
  for (const selector of selectors) {
    const text = $(selector).first().text().replace(/\s+/g, ' ').trim();
    if (text.length > 120) return text;
  }
  return $('body').text().replace(/\s+/g, ' ').trim();
}

function detectPrimaryCta($: cheerio.CheerioAPI): boolean {
  const ctaPattern =
    /\b(get started|contact us|book|schedule|free audit|request|quote|call now|speak to|demo|start now|let's talk)\b/i;
  const candidates = $('main a, main button, header a, header button').slice(0, 16);
  for (const el of candidates.toArray()) {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (ctaPattern.test(text)) return true;
  }
  return false;
}

function detectTrustSignals(pageText: string, $: cheerio.CheerioAPI): number {
  let score = 0;
  const patterns = [
    /\btestimonial/i,
    /\breview/i,
    /\bclient(s)?\b/i,
    /\btrusted by\b/i,
    /\bcase stud(y|ies)\b/i,
    /\baward(s)?\b/i,
    /\bcertified\b/i,
    /\bgoogle rating\b/i,
  ];

  for (const pattern of patterns) {
    if (pattern.test(pageText)) score += 1;
  }

  score += $('[aria-label*="review" i], [class*="testimonial" i], [class*="client" i]').length;
  return score;
}

function looksLikeAddress(text: string): boolean {
  return /\b(street|st\.|road|rd\.|avenue|ave\.|suite|ste\.|floor|fl\.|pakistan|usa|united states)\b/i.test(text);
}

function parsePage(
  html: string,
  pageUrl: string,
  fetchResult: FetchResult,
  domain: string,
  depth: number
): PageSnapshot {
  const $ = cheerio.load(html);
  const pageText = pickPrimaryText($);
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  const parsedUrl = new URL(pageUrl);

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    try {
      const absolute = new URL(href, pageUrl);
      if (!/^https?:$/i.test(absolute.protocol)) return;
      const normalized = normalizeUrl(absolute.toString());
      if (matchesDomain(absolute.hostname, domain)) {
        internalLinks.push(normalized);
      } else {
        externalLinks.push(normalized);
      }
    } catch {
      // Ignore invalid URLs.
    }
  });

  const openGraphMissing = ['og:title', 'og:description', 'og:image', 'og:url'].filter(
    (property) => $(`meta[property="${property}"]`).length === 0
  );

  const schemaTypes = extractJsonLdTypes($);
  const bodyText = $('body').text();
  const headingLevels = extractHeadingLevels($);
  const keywordTerms = extractKeywordTerms($('title').first().text().trim(), parsedUrl.pathname);
  const genericAltImages = $('img[alt]')
    .filter((_, el) => looksGenericAlt($(el).attr('alt') ?? ''))
    .map((_, el) => $(el).attr('src') ?? '')
    .get()
    .filter(Boolean);
  const localKeywordHits = countMatches(bodyText, ['near me', 'city', 'office', 'location', 'service area']);
  const aboveFoldText = $('body').find('header, main').first().text().slice(0, 500);

  return {
    url: pageUrl,
    depth,
    status: fetchResult.status,
    redirectChainLength: Math.max(0, fetchResult.redirectChain.length - 1),
    responseTimeMs: fetchResult.responseTimeMs,
    contentLength: fetchResult.contentLength,
    title: $('title').first().text().trim(),
    metaDescription: $('meta[name="description"]').attr('content')?.trim() ?? '',
    metaRobots: $('meta[name="robots"]').attr('content')?.trim() ?? '',
    canonical: $('link[rel="canonical"]').attr('href')?.trim() ?? null,
    h1s: $('h1')
      .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
      .get()
      .filter(Boolean),
    headingLevels,
    wordCount: countWords(pageText),
    internalLinks: unique(internalLinks),
    externalLinks: unique(externalLinks),
    imagesMissingAlt: $('img')
      .filter((_, el) => !$(el).attr('alt')?.trim())
      .map((_, el) => $(el).attr('src') ?? '')
      .get()
      .filter(Boolean),
    genericAltImages: unique(genericAltImages),
    lazyLoadedImages: $('img[loading="lazy"]').length,
    imageCount: $('img').length,
    openGraphMissing,
    twitterCardMissing: $('meta[name="twitter:card"]').length === 0,
    viewportMissing: $('meta[name="viewport"]').length === 0,
    forms: $('form').length,
    formFieldCount: $('form input, form select, form textarea').length,
    hasPrimaryCta: detectPrimaryCta($),
    ctaAboveFold: countMatches(aboveFoldText, ['contact', 'book', 'schedule', 'quote', 'get started', 'audit']) > 0,
    trustSignals: detectTrustSignals(bodyText, $),
    socialProofSignals: countMatches(bodyText, ['testimonial', 'case study', 'trusted by', 'clients', 'reviews']),
    schemaTypes,
    hasLocalBusinessSchema: schemaTypes.some((type) => /LocalBusiness|Organization|Store|ProfessionalService/i.test(type)),
    hasAuthorSignal:
      $('[rel="author"]').length > 0 ||
      $('meta[name="author"]').length > 0 ||
      $('[class*="author" i], [class*="byline" i]').length > 0,
    keywordTerms,
    citationCount: unique(externalLinks).length,
    textSample: pageText.slice(0, 500),
    hasNoindex:
      $('meta[name="robots"]').attr('content')?.toLowerCase().includes('noindex') ?? false,
    hasNofollow:
      $('meta[name="robots"]').attr('content')?.toLowerCase().includes('nofollow') ?? false,
    hasMapEmbed:
      $('iframe[src*="google.com/maps"], iframe[src*="maps.google"]').length > 0 ||
      $('a[href*="google.com/maps"], a[href*="maps.app.goo.gl"]').length > 0,
    hasPhone: /\+?\d[\d\s().-]{7,}\d/.test(bodyText),
    hasAddress: looksLikeAddress(bodyText),
    hasEmail: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(bodyText),
    faqQuestionCount: $('h2, h3, summary, dt')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text.endsWith('?')).length,
    localKeywordHits,
    lastModified: fetchResult.headers.get('last-modified'),
    scripts: $('script[src]')
      .map((_, el) => $(el).attr('src') ?? '')
      .get()
      .filter(Boolean),
    stylesheets: $('link[rel="stylesheet"]')
      .map((_, el) => $(el).attr('href') ?? '')
      .get()
      .filter(Boolean),
    pageSizeBytes: Buffer.byteLength(html, 'utf8'),
  };
}

async function crawlSite(domainInput: string): Promise<CrawlResult> {
  const crawlStartedAt = Date.now();
  const domain = normalizeDomainInput(domainInput);
  const variants = getOriginVariants(domain);
  const homepageFetch =
    (await tryFetch(variants.https)) ??
    (await tryFetch(variants.httpsWww)) ??
    (await tryFetch(variants.http));

  if (!homepageFetch) {
    throw new Error(`Could not reach ${domain}`);
  }

  const origin = new URL(homepageFetch.url).origin;
  const httpsRedirects = homepageFetch.url.startsWith('https://');
  const [runtimePerformance, searchConsole] = await Promise.all([
    analyzeRuntimePerformance(origin),
    fetchSearchConsoleSnapshot(domain),
  ]);

  const robotsFetch = await tryFetch(`${origin}/robots.txt`);
  const robotsTxtPresent = Boolean(robotsFetch?.ok);
  const robotsTxt = robotsFetch?.ok ? robotsFetch.html : '';
  const robotsDirectives = robotsTxt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^(disallow|allow|crawl-delay):/i.test(line));
  const sitemapCandidates = await discoverSitemaps(origin, robotsTxt);
  const llmsTxtPresent = Boolean((await tryFetch(`${origin}/llms.txt`))?.ok);
  const sitemapUrls = sitemapCandidates.filter((url) => {
    try {
      return matchesDomain(new URL(url).hostname, domain);
    } catch {
      return false;
    }
  });

  const queue: Array<{ url: string; depth: number }> = unique([
    normalizeUrl(homepageFetch.url),
    ...sitemapUrls
      .filter((url) => !url.endsWith('.xml') && !url.includes('sitemap'))
      .slice(0, MAX_PAGES)
      .map((url) => normalizeUrl(url)),
  ]).map((url) => ({ url, depth: 0 }));
  const visited = new Set<string>();
  const pages: PageSnapshot[] = [];
  const errors: string[] = [];
  let renderedPages = 0;

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    if (Date.now() - crawlStartedAt > CRAWL_TIME_BUDGET_MS) {
      errors.push(`Crawl time budget reached after ${Math.round(CRAWL_TIME_BUDGET_MS / 1000)} seconds`);
      break;
    }

    const next = queue.shift();
    if (!next || visited.has(next.url)) continue;
    visited.add(next.url);

    const response = await tryFetch(next.url);
    if (!response) {
      errors.push(`Request failed: ${next.url}`);
      continue;
    }

    if (!/html/i.test(response.contentType)) {
      continue;
    }

    let html = response.html;
    let finalUrl = response.url;
    if (isLikelyClientRendered(response.html) && renderedPages < MAX_RENDERED_PAGES) {
      const rendered = await renderHtmlWithPlaywright(response.url);
      if (rendered && rendered.renderedTextLength > 200) {
        html = rendered.html;
        finalUrl = rendered.finalUrl;
        renderedPages += 1;
      }
    }

    const effectiveResponse = {
      ...response,
      html,
      url: finalUrl,
      contentLength: Buffer.byteLength(html, 'utf8'),
    };

    const page = parsePage(html, finalUrl, effectiveResponse, domain, next.depth);
    pages.push(page);

    for (const link of page.internalLinks) {
      if (next.depth + 1 > MAX_DEPTH) continue;
      if (visited.has(link) || queue.some((entry) => entry.url === link)) continue;
      queue.push({ url: link, depth: next.depth + 1 });
    }
  }

  return {
    domain,
    origin,
    pages,
    robotsTxtPresent,
    sitemapPresent: sitemapUrls.length > 0,
    sitemapUrls,
    robotsDirectives,
    httpsRedirects,
    llmsTxtPresent,
    runtimePerformance,
    searchConsole,
    errors,
  };
}

function formatPageList(urls: string[], max = 4): string[] {
  return urls.slice(0, max);
}

function issue(
  severity: AuditIssue['severity'],
  title: string,
  description: string,
  affectedUrls: string[],
  fixGuide: string,
  impactScore: number,
  effortScore: number
): AuditIssue {
  return { severity, title, description, affectedUrls, fixGuide, impactScore, effortScore };
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[index] ?? 0;
}

function ratio(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return part / whole;
}

function buildTechnicalModule(crawl: CrawlResult): ModuleResult {
  const pages = crawl.pages;
  const inboundMap = buildInboundLinkMap(pages);
  const duplicateTitleMap = new Map<string, string[]>();
  const duplicateMetaMap = new Map<string, string[]>();
  const duplicateContentMap = new Map<string, string[]>();
  const canonicalIssues = pages.filter((page) => {
    if (!page.canonical) return true;
    try {
      return normalizeUrl(new URL(page.canonical, page.url).toString()) !== normalizeUrl(page.url);
    } catch {
      return true;
    }
  });
  const noindexPages = pages.filter((page) => page.hasNoindex);
  const nofollowPages = pages.filter((page) => page.hasNofollow);
  const brokenPages = pages.filter((page) => page.status >= 400);
  const redirectChainPages = pages.filter((page) => page.redirectChainLength > 1);
  const serverErrorPages = pages.filter((page) => page.status >= 500);
  const orphanCandidates = pages.filter((page) => (inboundMap.get(page.url) ?? 0) === 0 && page.url !== pages[0]?.url);
  const lowInboundPages = pages.filter((page) => (inboundMap.get(page.url) ?? 0) > 0 && (inboundMap.get(page.url) ?? 0) < 3);
  const deepPages = pages.filter((page) => page.depth > 4);
  const totalPages = Math.max(pages.length, 1);

  for (const page of pages) {
    if (!page.title) continue;
    const key = page.title.toLowerCase();
    const existing = duplicateTitleMap.get(key) ?? [];
    existing.push(page.url);
    duplicateTitleMap.set(key, existing);

    if (page.metaDescription) {
      const metaKey = page.metaDescription.toLowerCase();
      const existingMeta = duplicateMetaMap.get(metaKey) ?? [];
      existingMeta.push(page.url);
      duplicateMetaMap.set(metaKey, existingMeta);
    }

    const contentKey = createTextSignature(page.textSample);
    if (contentKey) {
      const existingContent = duplicateContentMap.get(contentKey) ?? [];
      existingContent.push(page.url);
      duplicateContentMap.set(contentKey, existingContent);
    }
  }

  const duplicateTitleUrls = [...duplicateTitleMap.values()].filter((urls) => urls.length > 1).flat();
  const duplicateMetaUrls = [...duplicateMetaMap.values()].filter((urls) => urls.length > 1).flat();
  const duplicateContentUrls = [...duplicateContentMap.values()].filter((urls) => urls.length > 1).flat();
  const issues: AuditIssue[] = [];

  if (!crawl.httpsRedirects) {
    issues.push(
      issue(
        'critical',
        'HTTP does not redirect cleanly to HTTPS',
        'The homepage did not resolve to a secure HTTPS destination, which weakens trust and can split indexing signals.',
        pages[0] ? [pages[0].url] : [],
        'Force a sitewide 301 redirect from HTTP to HTTPS at the load balancer or web server and update canonicals and sitemap URLs to the HTTPS version.',
        9,
        4
      )
    );
  }

  if (!crawl.robotsTxtPresent) {
    issues.push(
      issue(
        'warning',
        'robots.txt is missing',
        'Search engines expect a robots.txt file for crawl directives and sitemap discovery.',
        pages[0] ? [`${new URL(pages[0].url).origin}/robots.txt`] : [],
        'Add a robots.txt file at the site root with your crawl rules and sitemap declarations.',
        6,
        2
      )
    );
  }

  if (!crawl.sitemapPresent) {
    issues.push(
      issue(
        'warning',
        'XML sitemap could not be discovered',
        'The crawler could not confirm a sitemap from robots.txt or common sitemap paths.',
        pages[0] ? [`${new URL(pages[0].url).origin}/sitemap.xml`] : [],
        'Publish an XML sitemap, reference it in robots.txt, and keep it aligned with canonical indexable URLs.',
        7,
        3
      )
    );
  }

  if (crawl.robotsDirectives.length === 0 && crawl.robotsTxtPresent) {
    issues.push(
      issue(
        'opportunity',
        'robots.txt exists but contains no crawl directives',
        'The robots file is present but does not appear to include meaningful allow/disallow rules for crawl control.',
        [`${crawl.origin}/robots.txt`],
        'Review robots.txt and explicitly manage admin, faceted, or low-value URLs while keeping critical content crawlable.',
        4,
        2
      )
    );
  }

  if (canonicalIssues.length > 0) {
    issues.push(
      issue(
        canonicalIssues.length > 5 ? 'critical' : 'warning',
        `Canonical issues found on ${canonicalIssues.length} page${canonicalIssues.length === 1 ? '' : 's'}`,
        'Some pages are missing canonical tags or point at a different URL than the fetched page, which can dilute indexing signals.',
        formatPageList(canonicalIssues.map((page) => page.url)),
        'Add a valid self-referencing canonical to each indexable page and ensure parameterized or duplicate URLs point to the preferred canonical page.',
        8,
        4
      )
    );
  }

  if (redirectChainPages.length > 0) {
    issues.push(
      issue(
        redirectChainPages.length > 4 ? 'critical' : 'warning',
        `Redirect chains found on ${redirectChainPages.length} page${redirectChainPages.length === 1 ? '' : 's'}`,
        'Multiple redirects before the final destination waste crawl budget and slow down users.',
        formatPageList(redirectChainPages.map((page) => page.url)),
        'Update internal links to point directly to the final destination and remove intermediate redirects where possible.',
        7,
        4
      )
    );
  }

  if (serverErrorPages.length > 0) {
    issues.push(
      issue(
        'critical',
        `5xx server responses detected on ${serverErrorPages.length} page${serverErrorPages.length === 1 ? '' : 's'}`,
        'Server errors block crawling and can cause index loss if they persist.',
        formatPageList(serverErrorPages.map((page) => page.url)),
        'Investigate application/server logs, fix upstream failures, and return stable 200 or intentional 4xx responses for these URLs.',
        10,
        6
      )
    );
  }

  if (duplicateTitleUrls.length > 0) {
    issues.push(
      issue(
        duplicateTitleUrls.length > 6 ? 'critical' : 'warning',
        `Duplicate title tags across ${duplicateTitleUrls.length} URL${duplicateTitleUrls.length === 1 ? '' : 's'}`,
        'Multiple pages share the same title tag, which makes them harder for search engines to differentiate.',
        formatPageList(duplicateTitleUrls),
        'Make each page title unique and aligned with the page intent, ideally with a reusable template that still preserves uniqueness.',
        8,
        5
      )
    );
  }

  if (duplicateMetaUrls.length > 0) {
    issues.push(
      issue(
        duplicateMetaUrls.length > 6 ? 'critical' : 'warning',
        `Duplicate meta descriptions across ${duplicateMetaUrls.length} URL${duplicateMetaUrls.length === 1 ? '' : 's'}`,
        'Reused meta descriptions reduce snippet relevance and make multiple pages compete with the same message in search.',
        formatPageList(duplicateMetaUrls),
        'Write unique meta descriptions for each important page and avoid template duplication across services, locations, or product detail pages.',
        7,
        4
      )
    );
  }

  if (duplicateContentUrls.length > 0) {
    issues.push(
      issue(
        duplicateContentUrls.length > 6 ? 'warning' : 'opportunity',
        `Near-duplicate body content detected on ${duplicateContentUrls.length} URL${duplicateContentUrls.length === 1 ? '' : 's'}`,
        'Pages with highly similar copy can dilute topical focus and create unnecessary index competition.',
        formatPageList(duplicateContentUrls),
        'Differentiate overlapping pages with unique copy, intent-specific sections, and stronger canonical or consolidation decisions.',
        6,
        6
      )
    );
  }

  if (deepPages.length > 0) {
    issues.push(
      issue(
        'warning',
        `Pages deeper than crawl depth 4 found (${deepPages.length})`,
        'Important pages buried too deep in the site architecture are harder for users and crawlers to discover efficiently.',
        formatPageList(deepPages.map((page) => page.url)),
        'Flatten key sections using stronger hub pages, breadcrumbs, and contextual internal links so valuable pages are reachable within four clicks.',
        6,
        5
      )
    );
  }

  if (orphanCandidates.length > 0) {
    issues.push(
      issue(
        'opportunity',
        `Low-discovery pages detected (${orphanCandidates.length})`,
        'Some crawled pages expose no additional internal links, which often points to shallow linking or weak crawl paths.',
        formatPageList(orphanCandidates.map((page) => page.url)),
        'Strengthen internal linking from navigation, hubs, and related-content sections so important pages are reachable through multiple crawl paths.',
        5,
        5
      )
    );
  }

  if (lowInboundPages.length > 0) {
    issues.push(
      issue(
        'opportunity',
        `Pages with fewer than 3 inbound links detected (${lowInboundPages.length})`,
        'Pages with weak internal-link support are harder for crawlers and users to discover consistently.',
        formatPageList(lowInboundPages.map((page) => page.url)),
        'Add contextual links from relevant hubs, navigation, and related pages to strengthen internal prominence.',
        5,
        4
      )
    );
  }

  const score = clamp(
    100 -
      (crawl.httpsRedirects ? 0 : 18) -
      (crawl.robotsTxtPresent ? 0 : 8) -
      (crawl.sitemapPresent ? 0 : 10) -
      ratio(canonicalIssues.length, totalPages) * 35 -
      ratio(duplicateTitleUrls.length, totalPages) * 20 -
      ratio(duplicateMetaUrls.length, totalPages) * 15 -
      ratio(duplicateContentUrls.length, totalPages) * 12 -
      ratio(noindexPages.length, totalPages) * 12 -
      ratio(nofollowPages.length, totalPages) * 8 -
      ratio(redirectChainPages.length, totalPages) * 10 -
      ratio(serverErrorPages.length, totalPages) * 40 -
      ratio(brokenPages.length, totalPages) * 35 -
      ratio(lowInboundPages.length, totalPages) * 8 -
      ratio(deepPages.length, totalPages) * 10 -
      crawl.errors.length * 2
  );

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      totalUrlsCrawled: pages.length,
      robotsTxtPresent: crawl.robotsTxtPresent,
      sitemapPresent: crawl.sitemapPresent,
      sitemapUrlsDiscovered: crawl.sitemapUrls.length,
      httpsRedirects: crawl.httpsRedirects,
      canonicalIssues: canonicalIssues.length,
      duplicateTitles: duplicateTitleUrls.length,
      duplicateMetaDescriptions: duplicateMetaUrls.length,
      duplicateContentCandidates: duplicateContentUrls.length,
      noindexPages: noindexPages.length,
      nofollowPages: nofollowPages.length,
      redirectChainPages: redirectChainPages.length,
      serverErrorPages: serverErrorPages.length,
      brokenPages: brokenPages.length,
      crawlErrors: crawl.errors.length,
      orphanLikePages: orphanCandidates.length,
      lowInboundPages: lowInboundPages.length,
      deepPages: deepPages.length,
      llmsTxtPresent: crawl.llmsTxtPresent,
      robotsDirectives: crawl.robotsDirectives.length,
      searchConsoleConnected: crawl.searchConsole.connected,
      searchConsoleImpressions: crawl.searchConsole.impressions,
      searchConsoleClicks: crawl.searchConsole.clicks,
    },
  };
}

function buildOnPageModule(crawl: CrawlResult): ModuleResult {
  const pages = crawl.pages;
  const missingMeta = pages.filter((page) => page.metaDescription.length < 70);
  const missingTitle = pages.filter((page) => page.title.length < 15);
  const multipleH1 = pages.filter((page) => page.h1s.length > 1);
  const weakTitleLength = pages.filter((page) => page.title.length > 65 || page.title.length < 30);
  const thinContent = pages.filter((page) => page.wordCount < 250);
  const missingOg = pages.filter((page) => page.openGraphMissing.length > 0);
  const imagesMissingAlt = pages.filter((page) => page.imagesMissingAlt.length > 0);
  const genericAltPages = pages.filter((page) => page.genericAltImages.length > 0);
  const poorHeadingHierarchy = pages.filter((page) => !hasValidHeadingHierarchy(page.headingLevels));
  const lowKeywordPresence = pages.filter((page) => {
    const content = `${page.title} ${page.h1s.join(' ')} ${page.metaDescription}`;
    return countMatches(content, page.keywordTerms.slice(0, 3)) < 1;
  });
  const keywordStuffingPages = pages.filter((page) => {
    const words = tokenizeWords(page.textSample);
    if (words.length === 0 || page.keywordTerms.length === 0) return false;
    return page.keywordTerms.some((term) => {
      const occurrences = words.filter((word) => word === term).length;
      return occurrences / words.length > 0.06;
    });
  });
  const issues: AuditIssue[] = [];
  const totalPages = Math.max(pages.length, 1);

  if (missingMeta.length > 0) {
    issues.push(
      issue(
        missingMeta.length > 5 ? 'critical' : 'warning',
        `Weak or missing meta descriptions on ${missingMeta.length} page${missingMeta.length === 1 ? '' : 's'}`,
        'Pages with missing or very short meta descriptions may lose click-through rate because search engines have to guess the snippet.',
        formatPageList(missingMeta.map((page) => page.url)),
        'Write unique descriptions around 140-160 characters that match the page intent and include a clear value proposition.',
        8,
        4
      )
    );
  }

  if (weakTitleLength.length > 0) {
    issues.push(
      issue(
        'warning',
        `Title length problems on ${weakTitleLength.length} page${weakTitleLength.length === 1 ? '' : 's'}`,
        'Titles that are too short or too long are more likely to underperform in rankings and click-through rate.',
        formatPageList(weakTitleLength.map((page) => page.url)),
        'Keep important page titles concise, specific, and generally within the 30-65 character range.',
        6,
        3
      )
    );
  }

  if (multipleH1.length > 0) {
    issues.push(
      issue(
        'warning',
        `Multiple H1 tags found on ${multipleH1.length} page${multipleH1.length === 1 ? '' : 's'}`,
        'Pages with more than one H1 often have muddy heading structure and weaker topical focus.',
        formatPageList(multipleH1.map((page) => page.url)),
        'Use one primary H1 per page and move supporting headings to H2/H3 levels.',
        6,
        3
      )
    );
  }

  if (poorHeadingHierarchy.length > 0) {
    issues.push(
      issue(
        'warning',
        `Heading hierarchy issues on ${poorHeadingHierarchy.length} page${poorHeadingHierarchy.length === 1 ? '' : 's'}`,
        'Skipped heading levels or inconsistent structure make content harder for search engines and assistive technologies to interpret.',
        formatPageList(poorHeadingHierarchy.map((page) => page.url)),
        'Maintain a logical H1-H2-H3 sequence and avoid skipping heading levels in reusable content blocks.',
        5,
        4
      )
    );
  }

  if (thinContent.length > 0) {
    issues.push(
      issue(
        thinContent.length > 5 ? 'critical' : 'warning',
        `Thin-content pages detected (${thinContent.length})`,
        'Pages with very little unique body copy usually struggle to rank and convert.',
        formatPageList(thinContent.map((page) => page.url)),
        'Expand thin pages with useful, intent-matched content, FAQs, proof points, and stronger internal links.',
        7,
        6
      )
    );
  }

  if (imagesMissingAlt.length > 0) {
    issues.push(
      issue(
        'opportunity',
        `Images missing alt text on ${imagesMissingAlt.length} page${imagesMissingAlt.length === 1 ? '' : 's'}`,
        'Missing alt text weakens accessibility and reduces image-search context.',
        formatPageList(imagesMissingAlt.map((page) => page.url)),
        'Add concise descriptive alt text to informative images and keep decorative images empty-alt.',
        5,
        3
      )
    );
  }

  if (genericAltPages.length > 0) {
    issues.push(
      issue(
        'opportunity',
        `Generic image alt text found on ${genericAltPages.length} page${genericAltPages.length === 1 ? '' : 's'}`,
        'Generic alt attributes provide little accessibility or SEO value compared with descriptive image context.',
        formatPageList(genericAltPages.map((page) => page.url)),
        'Replace placeholder alt text like "image" or "banner" with concise descriptions of the image purpose.',
        4,
        2
      )
    );
  }

  if (lowKeywordPresence.length > 0) {
    issues.push(
      issue(
        'opportunity',
        `Weak keyword alignment detected on ${lowKeywordPresence.length} page${lowKeywordPresence.length === 1 ? '' : 's'}`,
        'Important page topics are not clearly reinforced in titles, headings, and meta descriptions.',
        formatPageList(lowKeywordPresence.map((page) => page.url)),
        'Align page titles, headings, and summaries around the core query the page is intended to rank for.',
        5,
        4
      )
    );
  }

  if (keywordStuffingPages.length > 0) {
    issues.push(
      issue(
        'warning',
        `Potential keyword-stuffing patterns on ${keywordStuffingPages.length} page${keywordStuffingPages.length === 1 ? '' : 's'}`,
        'Over-repeating a target term can make content feel unnatural and weaken overall content quality signals.',
        formatPageList(keywordStuffingPages.map((page) => page.url)),
        'Rewrite repetitive sections with natural language, synonyms, and topic-supporting phrases rather than repeating one keyword excessively.',
        5,
        5
      )
    );
  }

  const score = clamp(
    100 -
      ratio(missingMeta.length, totalPages) * 35 -
      ratio(missingTitle.length, totalPages) * 25 -
      ratio(weakTitleLength.length, totalPages) * 12 -
      ratio(multipleH1.length, totalPages) * 18 -
      ratio(poorHeadingHierarchy.length, totalPages) * 12 -
      ratio(thinContent.length, totalPages) * 30 -
      ratio(missingOg.length, totalPages) * 10 -
      ratio(imagesMissingAlt.length, totalPages) * 12 -
      ratio(genericAltPages.length, totalPages) * 8 -
      ratio(lowKeywordPresence.length, totalPages) * 10 -
      ratio(keywordStuffingPages.length, totalPages) * 8
  );

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      totalPages: pages.length,
      pagesWithTitles: pages.length - missingTitle.length,
      pagesWithMetaDescriptions: pages.length - missingMeta.length,
      titleLengthIssues: weakTitleLength.length,
      pagesWithMultipleH1: multipleH1.length,
      pagesWithHeadingHierarchyIssues: poorHeadingHierarchy.length,
      thinContentPages: thinContent.length,
      pagesMissingOpenGraph: missingOg.length,
      pagesWithImagesMissingAlt: imagesMissingAlt.length,
      pagesWithGenericAltText: genericAltPages.length,
      lowKeywordAlignmentPages: lowKeywordPresence.length,
      keywordStuffingCandidates: keywordStuffingPages.length,
      avgWordCount:
        pages.length > 0 ? Math.round(pages.reduce((sum, page) => sum + page.wordCount, 0) / pages.length) : 0,
      topQueriesFromSearchConsole: crawl.searchConsole.topQueries.slice(0, 5),
    },
  };
}

function buildPerformanceModule(crawl: CrawlResult): ModuleResult {
  const pages = crawl.pages;
  const runtime = crawl.runtimePerformance;
  const mobileRuntime = runtime.devices.mobile;
  const desktopRuntime = runtime.devices.desktop;
  const responseTimes = pages.map((page) => page.responseTimeMs);
  const slowPages = pages.filter((page) => page.responseTimeMs > 1500);
  const heavyPages = pages.filter((page) => page.pageSizeBytes > 1_500_000);
  const pagesMissingViewport = pages.filter((page) => page.viewportMissing);
  const poorlyOptimizedImages = pages.filter((page) => page.imageCount > 0 && page.lazyLoadedImages < Math.floor(page.imageCount / 2));
  const renderBlockingResources = pages.reduce(
    (sum, page) => sum + page.stylesheets.length + Math.min(page.scripts.length, 10),
    0
  );
  const avgRenderBlockingResources =
    pages.length > 0 ? Math.round(renderBlockingResources / pages.length) : 0;
  const thirdPartyScripts = unique(
    pages.flatMap((page) =>
      page.scripts.filter((src) => {
        try {
          return !matchesDomain(new URL(src, page.url).hostname, normalizeDomainInput(page.url));
        } catch {
          return false;
        }
      })
    )
  ).length;
  const issues: AuditIssue[] = [];

  if (slowPages.length > 0) {
    issues.push(
      issue(
        slowPages.length > 4 ? 'critical' : 'warning',
        `Slow server responses on ${slowPages.length} page${slowPages.length === 1 ? '' : 's'}`,
        'Measured fetch times suggest that users and bots wait too long before getting HTML back.',
        formatPageList(slowPages.map((page) => page.url)),
        'Improve backend response times with caching, edge delivery, lighter page generation, and faster upstream services.',
        8,
        6
      )
    );
  }

  if (heavyPages.length > 0) {
    issues.push(
      issue(
        'warning',
        `Large HTML payloads on ${heavyPages.length} page${heavyPages.length === 1 ? '' : 's'}`,
        'Large pages usually correlate with slower rendering, longer transfers, and weaker Core Web Vitals.',
        formatPageList(heavyPages.map((page) => page.url)),
        'Trim unused markup, lazy-load non-critical sections, compress assets, and move repeated content into lighter templates.',
        7,
        5
      )
    );
  }

  const worstLcpMs = [mobileRuntime.lcpMs, desktopRuntime.lcpMs].filter(
    (value): value is number => typeof value === 'number'
  ).sort((a, b) => b - a)[0] ?? null;
  if (worstLcpMs && worstLcpMs > 2500) {
    issues.push(
      issue(
        worstLcpMs > 4000 ? 'critical' : 'warning',
        `Largest Contentful Paint is ${Math.round(worstLcpMs)}ms`,
        'The main visible content is loading slower than Google recommends for a good user experience.',
        [crawl.origin],
        'Optimize the hero element, preload critical assets, compress large media, and reduce server and client-side blocking work.',
        9,
        6
      )
    );
  }

  const worstCls = [mobileRuntime.cls, desktopRuntime.cls].filter(
    (value): value is number => typeof value === 'number'
  ).sort((a, b) => b - a)[0] ?? null;
  if (worstCls && worstCls > 0.1) {
    issues.push(
      issue(
        worstCls > 0.25 ? 'critical' : 'warning',
        `Cumulative Layout Shift is ${worstCls.toFixed(2)}`,
        'Visual instability can frustrate users and hurt Core Web Vitals performance.',
        [crawl.origin],
        'Reserve space for images and embeds, stabilize dynamic components, and avoid injecting content above existing content.',
        8,
        5
      )
    );
  }

  const worstInpMs = [mobileRuntime.inpMs, desktopRuntime.inpMs].filter(
    (value): value is number => typeof value === 'number'
  ).sort((a, b) => b - a)[0] ?? null;
  if (worstInpMs && worstInpMs > 200) {
    issues.push(
      issue(
        worstInpMs > 500 ? 'critical' : 'warning',
        `Interaction responsiveness is slow at ${Math.round(worstInpMs)}ms`,
        'Interaction latency suggests the page is doing too much work on the main thread during user input.',
        [crawl.origin],
        'Reduce long tasks, defer non-critical JavaScript, and simplify interactive UI work on the first screen.',
        7,
        6
      )
    );
  }

  if (pagesMissingViewport.length > 0) {
    issues.push(
      issue(
        'critical',
        `Viewport meta tag missing on ${pagesMissingViewport.length} page${pagesMissingViewport.length === 1 ? '' : 's'}`,
        'Without a viewport declaration, mobile rendering quality drops sharply.',
        formatPageList(pagesMissingViewport.map((page) => page.url)),
        'Add `<meta name="viewport" content="width=device-width, initial-scale=1">` to every template.',
        9,
        2
      )
    );
  }

  if (poorlyOptimizedImages.length > 0) {
    issues.push(
      issue(
        'opportunity',
        `Image-loading opportunities on ${poorlyOptimizedImages.length} page${poorlyOptimizedImages.length === 1 ? '' : 's'}`,
        'Pages with many non-lazy images or heavy media tend to ship more bytes and delay rendering.',
        formatPageList(poorlyOptimizedImages.map((page) => page.url)),
        'Use responsive image sizes, lazy-load below-the-fold media, and adopt modern formats like WebP or AVIF where practical.',
        6,
        4
      )
    );
  }

  const avgResponse = pages.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / pages.length) : 0;
  const heuristicScore = clamp(
    100 -
      Math.floor(avgResponse / 120) -
      ratio(slowPages.length, Math.max(pages.length, 1)) * 28 -
      ratio(heavyPages.length, Math.max(pages.length, 1)) * 20 -
      ratio(pagesMissingViewport.length, Math.max(pages.length, 1)) * 30 -
      Math.max(0, avgRenderBlockingResources - 6) * 2 -
      (worstLcpMs ? Math.max(0, (worstLcpMs - 2500) / 250) : 0) -
      (worstCls ? Math.max(0, (worstCls - 0.1) * 100) : 0) -
      (worstInpMs ? Math.max(0, (worstInpMs - 200) / 30) : 0)
  );
  const providerScores = [runtime.lighthouseScore.mobile, runtime.lighthouseScore.desktop].filter(
    (value): value is number => typeof value === 'number' && !Number.isNaN(value)
  );
  const providerScore =
    providerScores.length > 0
      ? Math.round(providerScores.reduce((sum, value) => sum + value, 0) / providerScores.length)
      : null;
  let score =
    providerScore !== null
      ? clamp(providerScore * 0.65 + heuristicScore * 0.35)
      : heuristicScore;

  // Never surface an implausible zero for a measured run unless there is effectively no usable performance evidence.
  if (score === 0 && pages.length > 0) {
    if (providerScore !== null) {
      score = Math.max(15, Math.round(providerScore * 0.5));
    } else if (runtime.provider !== 'fallback') {
      score = 20;
    }
  }

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      avgResponseTimeMs: avgResponse,
      p75ResponseTimeMs: percentile(responseTimes, 0.75),
      slowPages: slowPages.length,
      heavyPages: heavyPages.length,
      avgHtmlSizeKb:
        pages.length > 0
          ? Math.round(pages.reduce((sum, page) => sum + page.pageSizeBytes, 0) / pages.length / 1024)
          : 0,
      renderBlockingResources,
      avgRenderBlockingResources,
      thirdPartyScripts,
      pagesMissingViewport: pagesMissingViewport.length,
      imageLazyLoadCoverage:
        pages.reduce((sum, page) => sum + page.lazyLoadedImages, 0) /
        Math.max(
          1,
          pages.reduce((sum, page) => sum + page.imageCount, 0)
        ),
      provider: runtime.provider,
      lighthouseScore: runtime.lighthouseScore,
      deviceReports: {
        mobile: mobileRuntime,
        desktop: desktopRuntime,
      },
      lcpMs: runtime.lcpMs,
      inpMs: runtime.inpMs,
      cls: runtime.cls,
      fcpMs: runtime.fcpMs,
      ttfbMs: runtime.ttfbMs,
      performanceNotes: runtime.notes,
    },
  };
}

function buildCroModule(crawl: CrawlResult): ModuleResult {
  const pages = crawl.pages;
  const pagesWithoutCta = pages.filter((page) => !page.hasPrimaryCta);
  const pagesWithoutAboveFoldCta = pages.filter((page) => !page.ctaAboveFold);
  const pagesWithForms = pages.filter((page) => page.forms > 0);
  const highFrictionForms = pagesWithForms.filter((page) => page.formFieldCount > 6);
  const lowTrustPages = pages.filter((page) => page.trustSignals < 2);
  const inaccessibleContactPages = pages.filter((page) => !page.hasPhone && !page.hasEmail && /contact|quote|get-started/i.test(page.url));
  const issues: AuditIssue[] = [];

  if (pagesWithoutCta.length > 0) {
    issues.push(
      issue(
        pagesWithoutCta.length > 6 ? 'critical' : 'warning',
        `Weak primary CTA signals on ${pagesWithoutCta.length} page${pagesWithoutCta.length === 1 ? '' : 's'}`,
        'Key pages do not expose an obvious action for the visitor, which can suppress lead generation.',
        formatPageList(pagesWithoutCta.map((page) => page.url)),
        'Add a clear primary CTA near the top of high-intent pages and keep the action language consistent across templates.',
        8,
        3
      )
    );
  }

  if (pagesWithoutAboveFoldCta.length > 0) {
    issues.push(
      issue(
        'warning',
        `Above-the-fold CTA visibility is weak on ${pagesWithoutAboveFoldCta.length} page${pagesWithoutAboveFoldCta.length === 1 ? '' : 's'}`,
        'Visitors should encounter an obvious next step without heavy scrolling on high-intent pages.',
        formatPageList(pagesWithoutAboveFoldCta.map((page) => page.url)),
        'Place a clear, prominent CTA in the first viewport on core service, pricing, and landing pages.',
        7,
        3
      )
    );
  }

  if (highFrictionForms.length > 0) {
    issues.push(
      issue(
        'warning',
        `High-friction forms detected on ${highFrictionForms.length} page${highFrictionForms.length === 1 ? '' : 's'}`,
        'Long forms usually convert worse unless every field is clearly justified.',
        formatPageList(highFrictionForms.map((page) => page.url)),
        'Reduce form fields to the minimum needed for qualification and push the rest into follow-up steps.',
        7,
        4
      )
    );
  }

  if (lowTrustPages.length > 0) {
    issues.push(
      issue(
        'opportunity',
        `Trust signals are thin on ${lowTrustPages.length} page${lowTrustPages.length === 1 ? '' : 's'}`,
        'Pages without testimonials, client logos, reviews, or proof points often underperform in conversion.',
        formatPageList(lowTrustPages.map((page) => page.url)),
        'Add social proof, client outcomes, certifications, or review snippets close to core CTAs.',
        6,
        4
      )
    );
  }

  if (inaccessibleContactPages.length > 0) {
    issues.push(
      issue(
        'warning',
        `Contact accessibility issues on ${inaccessibleContactPages.length} page${inaccessibleContactPages.length === 1 ? '' : 's'}`,
        'High-intent pages should expose obvious human contact options for visitors who are ready to convert.',
        formatPageList(inaccessibleContactPages.map((page) => page.url)),
        'Expose phone, email, or a clear contact CTA on lead-gen pages so users can reach the business without friction.',
        6,
        3
      )
    );
  }

  const avgFormFields =
    pagesWithForms.length > 0
      ? Math.round(pagesWithForms.reduce((sum, page) => sum + page.formFieldCount, 0) / pagesWithForms.length)
      : 0;

  const score = clamp(
    100 -
      ratio(pagesWithoutCta.length, Math.max(pages.length, 1)) * 35 -
      ratio(pagesWithoutAboveFoldCta.length, Math.max(pages.length, 1)) * 16 -
      ratio(highFrictionForms.length, Math.max(pagesWithForms.length, 1)) * 20 -
      ratio(lowTrustPages.length, Math.max(pages.length, 1)) * 22 -
      ratio(inaccessibleContactPages.length, Math.max(pages.length, 1)) * 12 -
      Math.max(0, avgFormFields - 5) * 2
  );

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      pagesWithPrimaryCta: pages.length - pagesWithoutCta.length,
      pagesWithoutPrimaryCta: pagesWithoutCta.length,
      pagesWithoutAboveFoldCta: pagesWithoutAboveFoldCta.length,
      pagesWithForms: pagesWithForms.length,
      avgFormFields,
      highFrictionForms: highFrictionForms.length,
      lowTrustPages: lowTrustPages.length,
      contactAccessibilityIssues: inaccessibleContactPages.length,
    },
  };
}

function buildLocalSeoModule(crawl: CrawlResult): ModuleResult {
  const pages = crawl.pages;
  const pagesWithContactSignals = pages.filter((page) => page.hasPhone || page.hasEmail || page.hasAddress);
  const locationPages = pages.filter((page) =>
    /\/(contact|location|locations|office|offices|about|service-area|areas-served)/i.test(new URL(page.url).pathname)
  );
  const pagesWithMaps = pages.filter((page) => page.hasMapEmbed);
  const localBusinessPages = pages.filter((page) => page.hasLocalBusinessSchema);
  const googleBusinessProfilePages = pages.filter((page) =>
    page.externalLinks.some((link) => /google\.(com|co\.[a-z]+)\/maps|business\.google\.com/i.test(link))
  );
  const localKeywordPages = pages.filter((page) => page.localKeywordHits > 0);
  const inconsistentNapPages = pages.filter((page) => page.hasPhone !== page.hasAddress);
  const multiLocation = locationPages.length > 1;
  const thinLocationPages = locationPages.filter((page) => page.wordCount < 300);
  const issues: AuditIssue[] = [];

  if (localBusinessPages.length === 0) {
    issues.push(
      issue(
        'critical',
        'LocalBusiness or Organization schema was not detected',
        'Local business markup helps search engines understand who you are, where you operate, and what you offer.',
        formatPageList(locationPages.map((page) => page.url).length > 0 ? locationPages.map((page) => page.url) : pages.map((page) => page.url)),
        'Add LocalBusiness or Organization JSON-LD with name, address, phone, URL, opening hours, and service area details.',
        8,
        4
      )
    );
  }

  if (pagesWithContactSignals.length === 0) {
    issues.push(
      issue(
        'critical',
        'Business contact signals are hard to find',
        'The crawl did not find strong phone, email, or address signals in the HTML, which weakens local trust and conversion.',
        formatPageList(pages.map((page) => page.url)),
        'Expose contact details clearly in the footer, contact page, and LocalBusiness schema.',
        8,
        3
      )
    );
  }

  if (pagesWithMaps.length === 0 && locationPages.length > 0) {
    issues.push(
      issue(
        'opportunity',
        'Location-oriented pages do not embed map signals',
        'Maps and location context help users and reinforce local relevance.',
        formatPageList(locationPages.map((page) => page.url)),
        'Embed a map or add strong address and service-area signals to location and contact pages.',
        5,
        3
      )
    );
  }

  if (inconsistentNapPages.length > 0) {
    issues.push(
      issue(
        'warning',
        `NAP consistency appears weak on ${inconsistentNapPages.length} page${inconsistentNapPages.length === 1 ? '' : 's'}`,
        'Some pages expose only partial local business contact details, which can weaken trust and local SEO consistency.',
        formatPageList(inconsistentNapPages.map((page) => page.url)),
        'Standardize name, address, and phone details across footer, contact, and location templates.',
        6,
        4
      )
    );
  }

  if (locationPages.length > 0 && localKeywordPages.length < locationPages.length) {
    issues.push(
      issue(
        'opportunity',
        'Location pages have weak local keyword reinforcement',
        'Pages intended for local visibility should use stronger geographic context in headings and body copy.',
        formatPageList(locationPages.map((page) => page.url)),
        'Add city, service-area, and locality terms naturally into page titles, headings, and unique supporting copy.',
        5,
        5
      )
    );
  }

  if (googleBusinessProfilePages.length === 0) {
    issues.push(
      issue(
        'opportunity',
        'No visible Google Business Profile signals were found',
        'A clear GBP link or embed can reinforce local entity signals and make it easier for users to verify the business.',
        formatPageList(locationPages.length > 0 ? locationPages.map((page) => page.url) : pages.map((page) => page.url)),
        'Link prominently to the Google Business Profile or map listing from contact and location pages.',
        4,
        2
      )
    );
  }

  if (multiLocation && thinLocationPages.length > 0) {
    issues.push(
      issue(
        'warning',
        `Thin multi-location pages detected (${thinLocationPages.length})`,
        'Multi-location businesses need stronger unique copy per location to avoid doorway-style thin pages.',
        formatPageList(thinLocationPages.map((page) => page.url)),
        'Enrich each location page with unique local proof, address details, service context, testimonials, and FAQs.',
        7,
        6
      )
    );
  }

  const score = clamp(
    100 -
      (localBusinessPages.length === 0 ? 25 : 0) -
      (pagesWithContactSignals.length === 0 ? 20 : 0) -
      (pagesWithMaps.length === 0 && locationPages.length > 0 ? 8 : 0) -
      (googleBusinessProfilePages.length === 0 ? 6 : 0) -
      ratio(inconsistentNapPages.length, Math.max(pages.length, 1)) * 10 -
      ratio(thinLocationPages.length, Math.max(locationPages.length, 1)) * 18 -
      Math.max(0, 2 - locationPages.length) * 4
  );

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      pagesWithContactSignals: pagesWithContactSignals.length,
      locationPages: locationPages.length,
      pagesWithMapEmbeds: pagesWithMaps.length,
      pagesWithLocalBusinessSchema: localBusinessPages.length,
      googleBusinessProfileSignals: googleBusinessProfilePages.length,
      localKeywordPages: localKeywordPages.length,
      inconsistentNapPages: inconsistentNapPages.length,
      multiLocationDetected: multiLocation,
      thinLocationPages: thinLocationPages.length,
    },
  };
}

function buildAiSeoModule(crawl: CrawlResult): ModuleResult {
  const pages = crawl.pages;
  const authorlessPages = pages.filter((page) => /\/blog|\/article|\/news|\/insights|\/resources/i.test(page.url) && !page.hasAuthorSignal);
  const pagesWithLowCitations = pages.filter((page) => page.citationCount < 2 && page.wordCount > 400);
  const stalePages = pages.filter((page) => page.lastModified === null);
  const pagesWithFaqSignals = pages.filter((page) => page.faqQuestionCount > 1);
  const entityWeakPages = pages.filter((page) => countMatches(`${page.title} ${page.metaDescription}`, [crawl.domain]) < 1);
  const topicalClusterMap = new Map<string, number>();
  for (const page of pages) {
    const cluster = new URL(page.url).pathname.split('/').filter(Boolean)[0] ?? 'root';
    topicalClusterMap.set(cluster, (topicalClusterMap.get(cluster) ?? 0) + 1);
  }
  const topicalClusters = new Set(topicalClusterMap.keys());
  const weakClusters = [...topicalClusterMap.entries()].filter(([, count]) => count < 2);
  const issues: AuditIssue[] = [];

  if (authorlessPages.length > 0) {
    issues.push(
      issue(
        authorlessPages.length > 3 ? 'warning' : 'opportunity',
        `Content pages missing author signals (${authorlessPages.length})`,
        'Author and reviewer attribution help reinforce expertise and trust on educational content.',
        formatPageList(authorlessPages.map((page) => page.url)),
        'Add author names, bios, credentials, and Person schema to editorial content templates.',
        7,
        4
      )
    );
  }

  if (pagesWithLowCitations.length > 0) {
    issues.push(
      issue(
        'warning',
        `Long-form pages with weak citation depth (${pagesWithLowCitations.length})`,
        'Authoritative outbound citations help substantiate claims and improve content trustworthiness.',
        formatPageList(pagesWithLowCitations.map((page) => page.url)),
        'Add relevant citations to primary sources, research, and supporting documents where you make substantive claims.',
        6,
        3
      )
    );
  }

  if (stalePages.length > 0) {
    issues.push(
      issue(
        'opportunity',
        `Pages without freshness signals (${stalePages.length})`,
        'No Last-Modified signal was visible for many pages, making content freshness harder to validate.',
        formatPageList(stalePages.map((page) => page.url)),
        'Expose publish/update dates in the HTML or structured data for important content pages.',
        5,
        4
      )
    );
  }

  if (!crawl.llmsTxtPresent) {
    issues.push(
      issue(
        'opportunity',
        'llms.txt was not found',
        'The emerging llms.txt convention can help AI systems understand how to reference and prioritize site content.',
        [`${crawl.origin}/llms.txt`],
        'Add an llms.txt file describing your most important sections, canonical content, and usage guidance for AI crawlers.',
        4,
        2
      )
    );
  }

  if (pagesWithFaqSignals.length === 0) {
    issues.push(
      issue(
        'opportunity',
        'FAQ-style content signals are limited',
        'Clear question-and-answer content can improve helpfulness, topical coverage, and structured data opportunities.',
        formatPageList(pages.map((page) => page.url)),
        'Add concise FAQ sections to key service and content pages where users naturally have repeat questions.',
        5,
        4
      )
    );
  }

  if (entityWeakPages.length > 0) {
    issues.push(
      issue(
        'warning',
        `Brand/entity reinforcement is weak on ${entityWeakPages.length} page${entityWeakPages.length === 1 ? '' : 's'}`,
        'Important pages should reinforce the brand and topic entity more clearly in titles and summaries.',
        formatPageList(entityWeakPages.map((page) => page.url)),
        'Improve entity clarity by aligning titles, descriptions, organization schema, and brand language across templates.',
        5,
        4
      )
    );
  }

  if (weakClusters.length > 0 && topicalClusters.size > 0) {
    issues.push(
      issue(
        'opportunity',
        `Topical clusters are shallow in ${weakClusters.length} section${weakClusters.length === 1 ? '' : 's'}`,
        'A broader supporting content structure helps demonstrate authority around important commercial topics.',
        formatPageList(
          pages
            .filter((page) => weakClusters.some(([cluster]) => page.url.includes(`/${cluster}`)))
            .map((page) => page.url)
        ),
        'Build supporting articles, FAQs, and related pages around core service or product clusters to increase topical depth.',
        5,
        6
      )
    );
  }

  const score = clamp(
    100 -
      ratio(authorlessPages.length, Math.max(pages.length, 1)) * 30 -
      ratio(pagesWithLowCitations.length, Math.max(pages.length, 1)) * 20 -
      ratio(stalePages.length, Math.max(pages.length, 1)) * 18 -
      (crawl.llmsTxtPresent ? 0 : 6) -
      (pagesWithFaqSignals.length > 0 ? 0 : 6) -
      ratio(entityWeakPages.length, Math.max(pages.length, 1)) * 10 -
      ratio(weakClusters.length, Math.max(topicalClusters.size, 1)) * 10
  );

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      pagesWithAuthorSignals: pages.length - authorlessPages.length,
      authorlessContentPages: authorlessPages.length,
      longFormPagesWithLowCitations: pagesWithLowCitations.length,
      pagesWithLastModifiedSignal: pages.length - stalePages.length,
      llmsTxtPresent: crawl.llmsTxtPresent,
      pagesWithFaqSignals: pagesWithFaqSignals.length,
      topicalClusters: topicalClusters.size,
      shallowTopicalClusters: weakClusters.length,
      entityWeakPages: entityWeakPages.length,
    },
  };
}

function buildSchemaModule(crawl: CrawlResult): ModuleResult {
  const pages = crawl.pages;
  const pagesWithSchema = pages.filter((page) => page.schemaTypes.length > 0);
  const articleSchemaPages = pages.filter((page) =>
    page.schemaTypes.some((type) => /Article|BlogPosting|NewsArticle/i.test(type))
  );
  const breadcrumbPages = pages.filter((page) =>
    page.schemaTypes.some((type) => /BreadcrumbList/i.test(type))
  );
  const faqPages = pages.filter((page) => page.schemaTypes.some((type) => /FAQPage/i.test(type)));
  const productPages = pages.filter((page) => page.schemaTypes.some((type) => /Product/i.test(type)));
  const reviewPages = pages.filter((page) => page.schemaTypes.some((type) => /Review|AggregateRating/i.test(type)));
  const localBusinessPages = pages.filter((page) => page.schemaTypes.some((type) => /LocalBusiness|Organization/i.test(type)));
  const testimonialPages = pages.filter((page) => page.socialProofSignals > 0);
  const issues: AuditIssue[] = [];

  if (pagesWithSchema.length === 0) {
    issues.push(
      issue(
        'critical',
        'No JSON-LD schema detected in the crawl',
        'Structured data helps search engines interpret page entities and unlock rich result eligibility.',
        formatPageList(pages.map((page) => page.url)),
        'Start with Organization, BreadcrumbList, and page-type-specific schema such as Article, FAQPage, Product, or Service.',
        9,
        5
      )
    );
  } else {
    if (breadcrumbPages.length < Math.max(1, Math.floor(pages.length / 3))) {
      issues.push(
        issue(
          'warning',
          'Breadcrumb schema coverage is limited',
          'Only a small portion of crawled pages expose breadcrumb markup.',
          formatPageList(pages.filter((page) => page.schemaTypes.length === 0).map((page) => page.url)),
          'Add BreadcrumbList JSON-LD to interior templates so hierarchy is explicit across the site.',
          6,
          3
        )
      );
    }

    if (articleSchemaPages.length === 0 && pages.some((page) => /\/blog|\/article|\/news/i.test(page.url))) {
      issues.push(
        issue(
          'warning',
          'Editorial pages are missing article schema',
          'The site appears to have editorial content but no Article/BlogPosting schema was found.',
          formatPageList(pages.filter((page) => /\/blog|\/article|\/news/i.test(page.url)).map((page) => page.url)),
          'Add Article or BlogPosting JSON-LD with headline, author, image, publish date, and publisher.',
          7,
          3
        )
      );
    }

    if (localBusinessPages.length === 0 && pages.some((page) => /contact|about|location/i.test(page.url))) {
      issues.push(
        issue(
          'warning',
          'Local/organization schema coverage is missing on business pages',
          'Contact and company pages should usually expose Organization or LocalBusiness markup.',
          formatPageList(pages.filter((page) => /contact|about|location/i.test(page.url)).map((page) => page.url)),
          'Add Organization or LocalBusiness schema with consistent business details on company and contact pages.',
          6,
          3
        )
      );
    }

    if (testimonialPages.length > 0 && reviewPages.length === 0) {
      issues.push(
        issue(
          'opportunity',
          'Review or AggregateRating schema is missing where trust content exists',
          'Pages appear to contain review or testimonial signals but do not expose structured review data.',
          formatPageList(testimonialPages.map((page) => page.url)),
          'Where eligible and policy-compliant, add Review or AggregateRating schema to pages with genuine review content.',
          5,
          4
        )
      );
    }
  }

  const score = clamp(
    100 -
      (pagesWithSchema.length === 0 ? 45 : 0) -
      ratio(Math.max(0, pages.length - pagesWithSchema.length), Math.max(pages.length, 1)) * 25 -
      Math.max(0, 3 - breadcrumbPages.length) * 5
  );

  return {
    score,
    grade: gradeFromScore(score),
    issues,
    rawData: {
      pagesWithAnySchema: pagesWithSchema.length,
      pagesWithoutSchema: pages.length - pagesWithSchema.length,
      pagesWithArticleSchema: articleSchemaPages.length,
      pagesWithBreadcrumbSchema: breadcrumbPages.length,
      pagesWithFaqSchema: faqPages.length,
      pagesWithProductSchema: productPages.length,
      pagesWithReviewSchema: reviewPages.length,
      pagesWithLocalBusinessSchema: localBusinessPages.length,
      testimonialSignalPages: testimonialPages.length,
      discoveredSchemaTypes: unique(pages.flatMap((page) => page.schemaTypes)),
    },
  };
}

export async function generateAuditModules(domain: string): Promise<AuditModules> {
  const crawl = await crawlSite(domain);

  if (crawl.pages.length === 0) {
    const detail = crawl.errors[0] ?? 'No crawlable HTML pages were collected.';
    throw new Error(`Audit produced no crawlable pages for ${domain}. ${detail}`);
  }

  return {
    technical: buildTechnicalModule(crawl),
    onPage: buildOnPageModule(crawl),
    performance: buildPerformanceModule(crawl),
    cro: buildCroModule(crawl),
    localSeo: buildLocalSeoModule(crawl),
    aiSeo: buildAiSeoModule(crawl),
    schema: buildSchemaModule(crawl),
  };
}

export function calculateOverallScore(modules: AuditModules): number {
  return weightedScore(modules);
}

export { MODULE_WEIGHTS };
