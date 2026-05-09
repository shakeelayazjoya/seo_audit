import { randomUUID } from 'node:crypto';
import { calculateOverallScore, generateAuditModules } from './audit-engine.ts';
import {
  claimNextAuditJob,
  failAuditJob,
  heartbeatAuditJob,
  saveAuditRecord,
} from './audit-store.ts';
import { logAppEvent } from './monitoring.ts';
import { generateAuditPdf, persistAuditPdfReport } from './report-pdf.ts';
import { db } from './db.ts';
import { sendEmail } from './email.ts';
import { buildAuditCompletedAdminEmail, buildReportDeliveryEmail } from './email-templates.ts';

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

function getAuditAdminEmail() {
  return (
    process.env.AUDIT_ADMIN_EMAIL?.trim() ||
    process.env.CONTACT_INBOX?.trim() ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    'ahmad@allinoneseoaudit.com'
  );
}

async function sendAuditCompletedAdminNotification(auditId: string) {
  const auditWithUser = await db.audit.findUnique({
    where: { id: auditId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!auditWithUser) {
    return;
  }

  const lead = await db.lead.findFirst({
    where: { auditId },
    orderBy: { createdAt: 'desc' },
    select: { email: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const reportUrl = `${appUrl}/?audit=${auditWithUser.id}`;
  const targetEmail = getAuditAdminEmail();
  const email = buildAuditCompletedAdminEmail({
    domain: auditWithUser.domain,
    auditId: auditWithUser.id,
    overallScore: auditWithUser.overallScore,
    reportUrl,
    requesterEmail: auditWithUser.user?.email ?? lead?.email ?? null,
    isPartial: auditWithUser.isPartial,
    partialReason: auditWithUser.partialReason,
  });

  const delivery = await sendEmail({
    to: targetEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  await logAppEvent({
    level: delivery.success ? 'info' : 'warn',
    type: 'audit.admin_email_sent',
    message: delivery.success ? 'Audit completion admin email sent' : 'Audit completion admin email skipped',
    context: {
      auditId: auditWithUser.id,
      domain: auditWithUser.domain,
      email: targetEmail,
      requesterEmail: auditWithUser.user?.email ?? lead?.email ?? null,
      provider: delivery.provider,
      skippedReason: delivery.skippedReason ?? null,
    },
  });
}

async function sendAuditCompletionEmail(auditId: string) {
  const auditWithUser = await db.audit.findUnique({
    where: { id: auditId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!auditWithUser?.user?.email) {
    await logAppEvent({
      level: 'warn',
      type: 'report.email_skipped',
      message: 'Audit report auto-email skipped because no user email is linked to the audit',
      context: {
        auditId,
        userId: auditWithUser?.userId ?? null,
      },
    });
    return;
  }

  const report = await generateAuditPdf(auditId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const reportUrl = `${appUrl}/?audit=${report.audit.id}`;
  const email = buildReportDeliveryEmail({
    domain: report.audit.domain,
    recipientEmail: auditWithUser.user.email,
    overallScore: report.audit.overallScore,
    reportUrl,
    modules: report.modules,
  });

  const delivery = await sendEmail({
    to: auditWithUser.user.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [
      {
        filename: report.filename,
        content: report.pdf,
        contentType: 'application/pdf',
      },
    ],
  });

  await logAppEvent({
    level: delivery.success ? 'info' : 'warn',
    type: 'report.email_sent',
    message: delivery.success ? 'Audit report email sent automatically' : 'Audit report auto-email skipped',
    context: {
      auditId: report.audit.id,
      email: auditWithUser.user.email,
      provider: delivery.provider,
      skippedReason: delivery.skippedReason ?? null,
      trigger: 'audit_complete',
    },
  });
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

    try {
      const storedReport = await persistAuditPdfReport(job.auditId);
      await logAppEvent({
        level: 'info',
        type: 'audit.report_stored',
        message: 'Audit PDF stored in Cloudinary',
        context: {
          auditId: job.auditId,
          domain: job.domain,
          publicId: storedReport.cloudinary.publicId,
          secureUrl: storedReport.cloudinary.secureUrl,
        },
      });
    } catch (storageError) {
      await logAppEvent({
        level: 'warn',
        type: 'audit.report_storage_failed',
        message: 'Audit PDF storage in Cloudinary failed',
        context: {
          auditId: job.auditId,
          domain: job.domain,
          error: storageError instanceof Error ? storageError.message : 'Unknown storage error',
        },
      });
    }

    try {
      await sendAuditCompletedAdminNotification(job.auditId);
    } catch (adminEmailError) {
      await logAppEvent({
        level: 'warn',
        type: 'audit.admin_email_failed',
        message: 'Audit completion admin email failed',
        context: {
          auditId: job.auditId,
          domain: job.domain,
          error: adminEmailError instanceof Error ? adminEmailError.message : 'Unknown email error',
        },
      });
    }

    try {
      await sendAuditCompletionEmail(job.auditId);
    } catch (emailError) {
      await logAppEvent({
        level: 'warn',
        type: 'report.email_failed',
        message: 'Audit report auto-email failed',
        context: {
          auditId: job.auditId,
          domain: job.domain,
          error: emailError instanceof Error ? emailError.message : 'Unknown email error',
        },
      });
    }

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
