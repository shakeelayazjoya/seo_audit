import { randomUUID } from 'node:crypto';
import { calculateOverallScore, generateAuditModules } from './audit-engine.ts';
import {
  claimNextAuditJob,
  failAuditJob,
  heartbeatAuditJob,
  saveAuditRecord,
} from './audit-store.ts';
import { logAppEvent } from './monitoring.ts';

const WORKER_AUDIT_TIMEOUT_MS = 150000;
const IDLE_SLEEP_MS = 4000;
const workerId = process.env.SEO_AUDIT_WORKER_ID ?? `worker-${randomUUID().slice(0, 8)}`;

let backgroundDrainActive = false;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPartialAuditState(modules: Awaited<ReturnType<typeof generateAuditModules>>) {
  const crawlPageCount =
    Number(modules.technical.rawData.totalUrlsCrawled ?? modules.onPage.rawData.totalPages ?? 0) || 0;
  const crawlErrors = Number(modules.technical.rawData.crawlErrors ?? 0) || 0;
  const sitemapUrlsDiscovered = Number(modules.technical.rawData.sitemapUrlsDiscovered ?? 0) || 0;
  const performanceProvider = String(modules.performance.rawData.provider ?? 'unknown');

  if (crawlPageCount === 0) {
    return {
      isPartial: true,
      partialReason: 'Audit completed without crawlable HTML pages.',
    };
  }

  if (crawlErrors > 0) {
    return {
      isPartial: true,
      partialReason: 'Audit completed with crawl errors. Review failed requests before trusting the score.',
    };
  }

  if (performanceProvider === 'fallback') {
    return {
      isPartial: true,
      partialReason: 'Audit completed without a verified performance provider. Review performance results carefully before trusting the score.',
    };
  }

  if (crawlPageCount < 2) {
    return {
      isPartial: true,
      partialReason: 'Audit completed with too few crawlable pages to produce a reliable site-wide score.',
    };
  }

  if (sitemapUrlsDiscovered > 0 && crawlPageCount < Math.min(5, sitemapUrlsDiscovered)) {
    return {
      isPartial: true,
      partialReason: 'Audit completed with only partial sitemap coverage. Review crawl depth before trusting the score.',
    };
  }

  return {
    isPartial: false,
    partialReason: null,
  };
}

export async function processOneAuditJob() {
  const job = await claimNextAuditJob(workerId);
  if (!job) return false;

  await logAppEvent({
    level: 'info',
    type: 'audit.job_claimed',
    message: 'Audit job claimed by worker',
    context: { auditId: job.auditId, domain: job.domain, workerId },
  });

  const heartbeat = setInterval(() => {
    void heartbeatAuditJob(job.auditId);
  }, 10000);

  try {
    const modules = await withTimeout(
      generateAuditModules(job.domain),
      WORKER_AUDIT_TIMEOUT_MS,
      'Audit timed out before completion'
    );
    const overallScore = calculateOverallScore(modules);
    const partial = getPartialAuditState(modules);
    const finishedAt = new Date().toISOString();

    await saveAuditRecord({
      id: job.auditId,
      domain: job.domain,
      status: 'complete',
      overallScore,
      modules,
      createdAt: job.audit.createdAt,
      updatedAt: finishedAt,
      errorMessage: null,
      isPartial: partial.isPartial,
      partialReason: partial.partialReason,
    });

    await logAppEvent({
      level: partial.isPartial ? 'warn' : 'info',
      type: 'audit.completed',
      message: partial.isPartial ? 'Audit completed with partial coverage' : 'Audit completed',
      context: { auditId: job.auditId, domain: job.domain, overallScore, workerId },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Audit worker failed';
    await failAuditJob({
      auditId: job.auditId,
      errorMessage,
    });

    await logAppEvent({
      level: 'error',
      type: 'audit.failed',
      message: 'Audit job failed',
      context: { auditId: job.auditId, domain: job.domain, errorMessage, workerId },
    });
  } finally {
    clearInterval(heartbeat);
  }

  return true;
}

export function triggerBackgroundAuditDrain() {
  if (backgroundDrainActive) {
    return;
  }

  backgroundDrainActive = true;

  void (async () => {
    try {
      while (await processOneAuditJob()) {
        await delay(25);
      }
    } finally {
      backgroundDrainActive = false;
    }
  })();
}

export async function runAuditWorkerLoop(runOnce = false) {
  do {
    const worked = await processOneAuditJob();
    if (runOnce) break;
    if (!worked) {
      await delay(IDLE_SLEEP_MS);
    }
  } while (true);
}
