import type { AuditModules } from './audit-engine.ts';
import type { AuditTrendPoint, DomainAuditHistory } from './types.ts';
import { db } from './db.ts';

export interface StoredAudit {
  id: string;
  domain: string;
  status: string;
  overallScore: number;
  technical: string | null;
  onPage: string | null;
  performance: string | null;
  cro: string | null;
  localSeo: string | null;
  aiSeo: string | null;
  schema: string | null;
  rawModules: string | null;
  errorMessage: string | null;
  isPartial: boolean;
  partialReason: string | null;
  crawlPageCount: number;
  crawlErrorCount: number;
  createdAt: string;
  updatedAt: string;
}

function normalizeDomain(domain: string): string {
  return domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '').toLowerCase();
}

function parseModuleScore(value: string | null): number | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { score?: number };
    return typeof parsed.score === 'number' ? parsed.score : null;
  } catch {
    return null;
  }
}

function toStoredAudit(record: {
  id: string;
  domain: string;
  status: string;
  overallScore: number;
  technical: string | null;
  onPage: string | null;
  performance: string | null;
  cro: string | null;
  localSeo: string | null;
  aiSeo: string | null;
  schema: string | null;
  rawModules: string | null;
  errorMessage: string | null;
  isPartial: boolean;
  partialReason: string | null;
  crawlPageCount: number;
  crawlErrorCount: number;
  createdAt: Date;
  updatedAt: Date;
}): StoredAudit {
  return {
    id: record.id,
    domain: record.domain,
    status: record.status,
    overallScore: record.overallScore,
    technical: record.technical,
    onPage: record.onPage,
    performance: record.performance,
    cro: record.cro,
    localSeo: record.localSeo,
    aiSeo: record.aiSeo,
    schema: record.schema,
    rawModules: record.rawModules,
    errorMessage: record.errorMessage,
    isPartial: record.isPartial,
    partialReason: record.partialReason,
    crawlPageCount: record.crawlPageCount,
    crawlErrorCount: record.crawlErrorCount,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toTrendPoint(audit: StoredAudit): AuditTrendPoint {
  return {
    id: audit.id,
    domain: audit.domain,
    overallScore: audit.overallScore,
    createdAt: audit.createdAt,
    technicalScore: parseModuleScore(audit.technical),
    onPageScore: parseModuleScore(audit.onPage),
    performanceScore: parseModuleScore(audit.performance),
    croScore: parseModuleScore(audit.cro),
    localSeoScore: parseModuleScore(audit.localSeo),
    aiSeoScore: parseModuleScore(audit.aiSeo),
    schemaScore: parseModuleScore(audit.schema),
  };
}

export async function enqueueAuditJob(input: {
  auditId: string;
  domain: string;
  userId?: string | null;
  priority?: number;
}) {
  const now = new Date();

  const result = await db.$transaction(async (tx) => {
    const audit = await tx.audit.create({
      data: {
        id: input.auditId,
        domain: input.domain,
        status: 'queued',
        overallScore: 0,
        userId: input.userId ?? null,
        createdAt: now,
        updatedAt: now,
      },
    });

    const job = await tx.auditJob.create({
      data: {
        auditId: audit.id,
        domain: input.domain,
        status: 'queued',
        priority: input.priority ?? 0,
      },
    });

    return { audit, job };
  });

  return { audit: toStoredAudit(result.audit), job: result.job };
}

export async function claimNextAuditJob(workerId: string) {
  const candidate = await db.auditJob.findFirst({
    where: {
      status: 'queued',
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    include: { audit: true },
  });

  if (!candidate) return null;

  const now = new Date();
  const updated = await db.auditJob.updateMany({
    where: {
      id: candidate.id,
      status: 'queued',
    },
    data: {
      status: 'running',
      workerId,
      attempts: { increment: 1 },
      lockedAt: now,
      startedAt: now,
      lastHeartbeatAt: now,
      errorMessage: null,
    },
  });

  if (updated.count === 0) return null;

  await db.audit.update({
    where: { id: candidate.auditId },
    data: {
      status: 'running',
      errorMessage: null,
      updatedAt: now,
    },
  });

  const job = await db.auditJob.findUnique({
    where: { id: candidate.id },
    include: { audit: true },
  });

  if (!job) return null;

  return {
    id: job.id,
    auditId: job.auditId,
    domain: job.domain,
    attempts: job.attempts,
    audit: toStoredAudit(job.audit),
  };
}

export async function heartbeatAuditJob(auditId: string) {
  const now = new Date();
  await db.auditJob.updateMany({
    where: { auditId, status: 'running' },
    data: {
      lastHeartbeatAt: now,
      updatedAt: now,
    },
  });
}

export async function saveAuditRecord(input: {
  id: string;
  domain: string;
  status: string;
  overallScore: number;
  modules: AuditModules;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string | null;
  isPartial?: boolean;
  partialReason?: string | null;
}) {
  const crawlPageCount =
    Number(
      input.modules.technical.rawData.totalUrlsCrawled ??
      input.modules.onPage.rawData.totalPages ??
      0
    ) || 0;
  const crawlErrorCount = Number(input.modules.technical.rawData.crawlErrors ?? 0) || 0;

  const audit = await db.audit.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      domain: input.domain,
      status: input.status,
      overallScore: input.overallScore,
      technical: JSON.stringify(input.modules.technical),
      onPage: JSON.stringify(input.modules.onPage),
      performance: JSON.stringify(input.modules.performance),
      cro: JSON.stringify(input.modules.cro),
      localSeo: JSON.stringify(input.modules.localSeo),
      aiSeo: JSON.stringify(input.modules.aiSeo),
      schema: JSON.stringify(input.modules.schema),
      rawModules: JSON.stringify(input.modules),
      errorMessage: input.errorMessage ?? null,
      isPartial: input.isPartial ?? false,
      partialReason: input.partialReason ?? null,
      crawlPageCount,
      crawlErrorCount,
      createdAt: new Date(input.createdAt),
      updatedAt: new Date(input.updatedAt),
    },
    update: {
      domain: input.domain,
      status: input.status,
      overallScore: input.overallScore,
      technical: JSON.stringify(input.modules.technical),
      onPage: JSON.stringify(input.modules.onPage),
      performance: JSON.stringify(input.modules.performance),
      cro: JSON.stringify(input.modules.cro),
      localSeo: JSON.stringify(input.modules.localSeo),
      aiSeo: JSON.stringify(input.modules.aiSeo),
      schema: JSON.stringify(input.modules.schema),
      rawModules: JSON.stringify(input.modules),
      errorMessage: input.errorMessage ?? null,
      isPartial: input.isPartial ?? false,
      partialReason: input.partialReason ?? null,
      crawlPageCount,
      crawlErrorCount,
      updatedAt: new Date(input.updatedAt),
    },
  });

  await db.auditJob.updateMany({
    where: { auditId: input.id },
    data: {
      status: 'complete',
      finishedAt: new Date(input.updatedAt),
      errorMessage: null,
      updatedAt: new Date(input.updatedAt),
      lastHeartbeatAt: new Date(input.updatedAt),
    },
  });

  return toStoredAudit(audit);
}

export async function failAuditJob(input: {
  auditId: string;
  errorMessage: string;
}) {
  const now = new Date();

  await db.$transaction([
    db.audit.update({
      where: { id: input.auditId },
      data: {
        status: 'failed',
        errorMessage: input.errorMessage,
        updatedAt: now,
      },
    }),
    db.auditJob.updateMany({
      where: { auditId: input.auditId },
      data: {
        status: 'failed',
        errorMessage: input.errorMessage,
        finishedAt: now,
        updatedAt: now,
        lastHeartbeatAt: now,
      },
    }),
  ]);
}

export async function getAuditRecord(id: string) {
  const audit = await db.audit.findUnique({
    where: { id },
  });

  return audit ? toStoredAudit(audit) : null;
}

export async function listAuditRecords(limit = 20, userId?: string | null) {
  const audits = await db.audit.findMany({
    where: {
      status: 'complete',
      ...(userId ? { userId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return audits.map(toStoredAudit);
}

export async function getAuditHistoryByDomain(
  domain: string,
  limit = 12,
  userId?: string | null,
): Promise<AuditTrendPoint[]> {
  const normalized = normalizeDomain(domain);
  const audits = await db.audit.findMany({
    where: {
      status: 'complete',
      ...(userId ? { userId } : {}),
      domain: {
        in: [domain, normalized, `www.${normalized}`],
      },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  return audits.map((audit) => toTrendPoint(toStoredAudit(audit)));
}

export async function listDomainAuditHistory(limit = 25, userId?: string | null): Promise<DomainAuditHistory[]> {
  const audits = (await db.audit.findMany({
    where: {
      status: 'complete',
      ...(userId ? { userId } : {}),
    },
    orderBy: { createdAt: 'asc' },
  })).map(toStoredAudit);

  const grouped = new Map<string, StoredAudit[]>();
  for (const audit of audits) {
    const key = normalizeDomain(audit.domain);
    const bucket = grouped.get(key) ?? [];
    bucket.push(audit);
    grouped.set(key, bucket);
  }

  return [...grouped.values()]
    .map((bucket) => {
      const latest = bucket[bucket.length - 1];
      const scores = bucket.map((audit) => audit.overallScore);
      return {
        domain: latest.domain,
        latestAuditId: latest.id,
        latestScore: latest.overallScore,
        bestScore: Math.max(...scores),
        averageScore: Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)),
        auditCount: bucket.length,
        lastAuditedAt: latest.createdAt,
        history: bucket.slice(-12).map(toTrendPoint),
      };
    })
    .sort((a, b) => new Date(b.lastAuditedAt).getTime() - new Date(a.lastAuditedAt).getTime())
    .slice(0, limit);
}

export async function saveLeadRecord(input: {
  email: string;
  domain: string | null;
  auditId: string | null;
  source: string;
  userId?: string | null;
}) {
  return db.lead.create({
    data: {
      email: input.email,
      domain: input.domain,
      auditId: input.auditId,
      source: input.source,
      userId: input.userId ?? null,
    },
  });
}

export async function listAuditJobCounts() {
  const grouped = await db.auditJob.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const counts = {
    queued: 0,
    running: 0,
    complete: 0,
    failed: 0,
  };

  for (const item of grouped) {
    if (item.status in counts) {
      counts[item.status as keyof typeof counts] = item._count.status;
    }
  }

  return counts;
}

export async function cleanupInvalidAudits() {
  const invalid = await db.audit.findMany({
    where: {
      OR: [
        { status: 'complete', crawlPageCount: 0 },
        { status: 'complete', rawModules: null },
      ],
    },
    select: { id: true },
  });

  if (invalid.length === 0) {
    return { deletedCount: 0 };
  }

  const ids = invalid.map((item) => item.id);
  await db.$transaction([
    db.commercialRequest.deleteMany({ where: { auditId: { in: ids } } }),
    db.auditJob.deleteMany({ where: { auditId: { in: ids } } }),
    db.audit.deleteMany({ where: { id: { in: ids } } }),
  ]);

  return { deletedCount: ids.length };
}
