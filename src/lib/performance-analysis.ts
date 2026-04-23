import { createRequire } from 'node:module';
import type { Browser } from 'playwright';

export interface RuntimePerformanceMetrics {
  provider: 'pagespeed' | 'playwright' | 'lighthouse' | 'fallback';
  lighthouseScore: {
    mobile: number | null;
    desktop: number | null;
  };
  lcpMs: number | null;
  inpMs: number | null;
  cls: number | null;
  fcpMs: number | null;
  ttfbMs: number | null;
  renderBlockingResources: number | null;
  thirdPartyBytes: number | null;
  notes: string[];
}

const require = createRequire(import.meta.url);
let customPerformanceAnalyzer:
  | ((originUrl: string) => Promise<RuntimePerformanceMetrics | null>)
  | null = null;

export function registerCustomPerformanceAnalyzer(
  analyzer: (originUrl: string) => Promise<RuntimePerformanceMetrics | null>
) {
  customPerformanceAnalyzer = analyzer;
}

function toHundredScale(score: number | null | undefined): number | null {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  return Math.round(score * 100);
}

async function fetchPageSpeed(originUrl: string): Promise<RuntimePerformanceMetrics | null> {
  const notes: string[] = [];
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  const run = async (strategy: 'mobile' | 'desktop') => {
    const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    endpoint.searchParams.set('url', originUrl);
    endpoint.searchParams.set('strategy', strategy);
    endpoint.searchParams.set('category', 'performance');
    if (apiKey) endpoint.searchParams.set('key', apiKey);

    const response = await fetch(endpoint, {
      headers: {
        'user-agent': 'SeoAuditBot/1.0 performance analyzer',
      },
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      throw new Error(`PageSpeed ${strategy} failed with ${response.status}`);
    }

    return response.json();
  };

  try {
    const [mobile, desktop] = await Promise.all([run('mobile'), run('desktop')]);
    const mobileAudits = mobile?.lighthouseResult?.audits ?? {};
    const loadingExperience = mobile?.loadingExperience?.metrics ?? {};

    return {
      provider: 'pagespeed',
      lighthouseScore: {
        mobile: toHundredScale(mobile?.lighthouseResult?.categories?.performance?.score),
        desktop: toHundredScale(desktop?.lighthouseResult?.categories?.performance?.score),
      },
      lcpMs:
        mobileAudits['largest-contentful-paint']?.numericValue ??
        loadingExperience?.LARGEST_CONTENTFUL_PAINT_MS?.percentile ??
        null,
      inpMs:
        mobileAudits['interactive']?.numericValue ??
        loadingExperience?.INTERACTION_TO_NEXT_PAINT?.percentile ??
        null,
      cls:
        mobileAudits['cumulative-layout-shift']?.numericValue ??
        (typeof loadingExperience?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile === 'number'
          ? loadingExperience.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100
          : null),
      fcpMs: mobileAudits['first-contentful-paint']?.numericValue ?? null,
      ttfbMs: mobileAudits['server-response-time']?.numericValue ?? null,
      renderBlockingResources:
        mobileAudits['render-blocking-resources']?.details?.overallSavingsMs ?? null,
      thirdPartyBytes: mobileAudits['third-party-summary']?.numericValue ?? null,
      notes,
    };
  } catch (error) {
    notes.push(error instanceof Error ? error.message : 'PageSpeed request failed');
    return null;
  }
}

async function runPlaywrightLab(originUrl: string): Promise<RuntimePerformanceMetrics | null> {
  let browser: Browser | null = null;
  const notes: string[] = [];

  try {
    const { chromium } = require('playwright') as typeof import('playwright');
    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await page.goto(originUrl, {
      waitUntil: 'load',
      timeout: 30000,
    });

    const metrics = await page.evaluate(async () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      let lcp = 0;
      let cls = 0;

      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          lcp = last.startTime;
        }
      });

      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
          if (!entry.hadRecentInput) {
            cls += entry.value ?? 0;
          }
        }
      });

      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      await new Promise((resolve) => window.setTimeout(resolve, 4000));

      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const thirdPartyBytes = resources
        .filter((entry) => {
          try {
            return new URL(entry.name).origin !== window.location.origin;
          } catch {
            return false;
          }
        })
        .reduce((sum, entry) => sum + (entry.transferSize || 0), 0);

      const renderBlockingResources = resources.filter(
        (entry) =>
          entry.initiatorType === 'link' ||
          entry.initiatorType === 'script'
      ).length;

      const paintEntries = performance.getEntriesByType('paint');
      const fcp =
        paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime ?? null;
      const ttfb = nav ? nav.responseStart : null;
      const domInteractive = nav ? nav.domInteractive : null;

      return {
        lcpMs: lcp || null,
        cls: cls || null,
        fcpMs: fcp,
        ttfbMs: ttfb,
        inpMs: domInteractive,
        renderBlockingResources,
        thirdPartyBytes,
      };
    });

    const heuristicScore = [
      metrics.lcpMs !== null ? (metrics.lcpMs <= 2500 ? 100 : metrics.lcpMs <= 4000 ? 70 : 35) : 50,
      metrics.cls !== null ? (metrics.cls <= 0.1 ? 100 : metrics.cls <= 0.25 ? 65 : 30) : 50,
      metrics.fcpMs !== null ? (metrics.fcpMs <= 1800 ? 100 : metrics.fcpMs <= 3000 ? 70 : 35) : 50,
      metrics.ttfbMs !== null ? (metrics.ttfbMs <= 800 ? 100 : metrics.ttfbMs <= 1800 ? 70 : 35) : 50,
    ];
    const labScore = Math.round(heuristicScore.reduce((sum, value) => sum + value, 0) / heuristicScore.length);

    return {
      provider: 'playwright',
      lighthouseScore: {
        mobile: labScore,
        desktop: null,
      },
      lcpMs: metrics.lcpMs,
      inpMs: metrics.inpMs,
      cls: metrics.cls,
      fcpMs: metrics.fcpMs,
      ttfbMs: metrics.ttfbMs,
      renderBlockingResources: metrics.renderBlockingResources,
      thirdPartyBytes: metrics.thirdPartyBytes,
      notes: [...notes, 'Fell back to browser-collected lab metrics because PageSpeed was unavailable.'],
    };
  } catch (error) {
    notes.push(error instanceof Error ? error.message : 'Playwright lab analysis failed');
    return null;
  } finally {
    await browser?.close().catch(() => {});
  }
}

export async function analyzeRuntimePerformance(originUrl: string): Promise<RuntimePerformanceMetrics> {
  if (customPerformanceAnalyzer) {
    const customResult = await customPerformanceAnalyzer(originUrl);
    if (customResult) return customResult;
  }

  const pageSpeed = await fetchPageSpeed(originUrl);
  if (pageSpeed) return pageSpeed;

  const playwrightLab = await runPlaywrightLab(originUrl);
  if (playwrightLab) return playwrightLab;

  return {
    provider: 'fallback',
    lighthouseScore: {
      mobile: null,
      desktop: null,
    },
    lcpMs: null,
    inpMs: null,
    cls: null,
    fcpMs: null,
    ttfbMs: null,
    renderBlockingResources: null,
    thirdPartyBytes: null,
    notes: ['PageSpeed and Playwright performance providers were unavailable.'],
  };
}

export async function renderHtmlWithPlaywright(
  url: string
): Promise<{ html: string; finalUrl: string; title: string; renderedTextLength: number } | null> {
  let browser: Browser | null = null;

  try {
    const { chromium } = require('playwright') as typeof import('playwright');
    browser = await chromium.launch({
      headless: true,
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 25000,
    });
    const html = await page.content();
    const title = await page.title();
    const bodyText = await page.locator('body').innerText().catch(() => '');

    return {
      html,
      finalUrl: page.url(),
      title,
      renderedTextLength: bodyText.trim().length,
    };
  } catch {
    return null;
  } finally {
    await browser?.close().catch(() => {});
  }
}
