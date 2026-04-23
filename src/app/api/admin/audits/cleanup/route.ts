import { NextRequest, NextResponse } from 'next/server';
import { cleanupInvalidAudits } from '@/lib/audit-store';
import { getSessionFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await cleanupInvalidAudits();
  return NextResponse.json(result);
}
