import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listAuditJobCounts } from '@/lib/audit-store';

export const runtime = 'nodejs';

export async function GET() {
  const [jobs, audits, leads, users, partialAudits] = await Promise.all([
    listAuditJobCounts(),
    db.audit.count(),
    db.lead.count(),
    db.user.count(),
    db.audit.count({ where: { isPartial: true } }),
  ]);

  return NextResponse.json({
    jobs,
    audits,
    leads,
    users,
    partialAudits,
    collectedAt: new Date().toISOString(),
  });
}
