import { db } from './db.ts';
import type { Prisma } from '@prisma/client';

export async function logAppEvent(input: {
  level: 'info' | 'warn' | 'error';
  type: string;
  message: string;
  context?: Record<string, unknown>;
}) {
  await db.appEvent.create({
    data: {
      level: input.level,
      type: input.type,
      message: input.message,
      context: (input.context ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  }).catch(() => {});
}

export async function getHealthSnapshot() {
  const [jobCounts, recentFailures, totalAudits] = await Promise.all([
    db.auditJob.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    db.appEvent.count({
      where: {
        level: 'error',
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      },
    }),
    db.audit.count(),
  ]);

  const counts = {
    queued: 0,
    running: 0,
    complete: 0,
    failed: 0,
  };

  for (const row of jobCounts) {
    if (row.status in counts) {
      counts[row.status as keyof typeof counts] = row._count.status;
    }
  }

  return {
    database: 'ok',
    jobs: counts,
    recentErrorEvents: recentFailures,
    totalAudits,
    checkedAt: new Date().toISOString(),
  };
}
