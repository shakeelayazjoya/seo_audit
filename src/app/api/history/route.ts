import { NextRequest, NextResponse } from 'next/server';
import { listDomainAuditHistory } from '@/lib/audit-store';
import { getSessionFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const history = await listDomainAuditHistory(30, session?.userId ?? null);
    return NextResponse.json({ history });
  } catch (error) {
    console.warn('[GET /api/history] Returning empty history because persistence is unavailable:', error);
    return NextResponse.json({ history: [] });
  }
}
