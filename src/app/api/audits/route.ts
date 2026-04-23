import { NextRequest, NextResponse } from 'next/server';
import { listAuditRecords } from '@/lib/audit-store';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const audits = await listAuditRecords(20, session?.userId ?? null);

    return NextResponse.json({ audits });
  } catch (error) {
    console.warn('[GET /api/audits] Returning empty audit list because persistence is unavailable:', error);
    return NextResponse.json({ audits: [] });
  }
}
