import {
  registerCustomPerformanceAnalyzer,
  type DevicePerformanceReport,
  type RuntimePerformanceMetrics,
} from '../src/lib/performance-analysis.ts';
import { runAuditWorkerLoop } from '../src/lib/audit-worker-runtime.ts';

function toHundredScale(score: number | null | undefined) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  return Math.round(score * 100);
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

registerCustomPerformanceAnalyzer(async (originUrl) => {
  let chrome: { port: number; kill?: () => Promise<void> | void } | null = null;

  try {
    const chromeLauncherModule = await import('chrome-launcher');
    const lighthouseModule = await import('lighthouse');
    const launch = chromeLauncherModule.launch;

    chrome = await launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    });

    const lighthouse = lighthouseModule.default ?? lighthouseModule;
    const mobileRun = await withTimeout(
      lighthouse(originUrl, {
        port: chrome.port,
        onlyCategories: ['performance'],
        output: 'json',
        formFactor: 'mobile',
        maxWaitForLoad: 45000,
      }),
      70000,
      'Lighthouse mobile run timed out in worker'
    );

    const desktopRun = await withTimeout(
      lighthouse(originUrl, {
        port: chrome.port,
        onlyCategories: ['performance'],
        output: 'json',
        formFactor: 'desktop',
        maxWaitForLoad: 45000,
      }),
      70000,
      'Lighthouse desktop run timed out in worker'
    );

    const mobileAudits = (mobileRun?.lhr?.audits ?? {}) as Record<string, { numericValue?: number; details?: Record<string, unknown> }>;
    const desktopAudits = (desktopRun?.lhr?.audits ?? {}) as Record<string, { numericValue?: number; details?: Record<string, unknown> }>;
    const renderBlockingDetails = mobileAudits['render-blocking-resources']?.details as
      | { overallSavingsMs?: number }
      | undefined;
    const desktopRenderBlockingDetails = desktopAudits['render-blocking-resources']?.details as
      | { overallSavingsMs?: number }
      | undefined;
    const mobileReport: DevicePerformanceReport = {
      score: toHundredScale(mobileRun?.lhr?.categories?.performance?.score),
      lcpMs: mobileAudits['largest-contentful-paint']?.numericValue ?? null,
      inpMs:
        mobileAudits['interaction-to-next-paint']?.numericValue ??
        mobileAudits['interactive']?.numericValue ??
        null,
      cls: mobileAudits['cumulative-layout-shift']?.numericValue ?? null,
      fcpMs: mobileAudits['first-contentful-paint']?.numericValue ?? null,
      ttfbMs: mobileAudits['server-response-time']?.numericValue ?? null,
      renderBlockingResources: renderBlockingDetails?.overallSavingsMs ?? null,
      thirdPartyBytes: mobileAudits['third-party-summary']?.numericValue ?? null,
      notes: ['Collected in detached Lighthouse worker process.'],
    };
    const desktopReport: DevicePerformanceReport = {
      score: toHundredScale(desktopRun?.lhr?.categories?.performance?.score),
      lcpMs: desktopAudits['largest-contentful-paint']?.numericValue ?? null,
      inpMs:
        desktopAudits['interaction-to-next-paint']?.numericValue ??
        desktopAudits['interactive']?.numericValue ??
        null,
      cls: desktopAudits['cumulative-layout-shift']?.numericValue ?? null,
      fcpMs: desktopAudits['first-contentful-paint']?.numericValue ?? null,
      ttfbMs: desktopAudits['server-response-time']?.numericValue ?? null,
      renderBlockingResources: desktopRenderBlockingDetails?.overallSavingsMs ?? null,
      thirdPartyBytes: desktopAudits['third-party-summary']?.numericValue ?? null,
      notes: ['Collected in detached Lighthouse worker process.'],
    };
    return {
      provider: 'lighthouse',
      lighthouseScore: {
        mobile: mobileReport.score,
        desktop: desktopReport.score,
      },
      devices: {
        mobile: mobileReport,
        desktop: desktopReport,
      },
      lcpMs: mobileReport.lcpMs,
      inpMs: mobileReport.inpMs,
      cls: mobileReport.cls,
      fcpMs: mobileReport.fcpMs,
      ttfbMs: mobileReport.ttfbMs,
      renderBlockingResources: mobileReport.renderBlockingResources,
      thirdPartyBytes: mobileReport.thirdPartyBytes,
      notes: ['Collected in detached Lighthouse worker process.'],
    } satisfies RuntimePerformanceMetrics;
  } catch {
    return null;
  } finally {
    await Promise.resolve(chrome?.kill?.()).catch(() => {});
  }
});

await runAuditWorkerLoop(process.argv.includes('--once'));
