import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getAdminCommercialOverview } from '@/lib/admin-commercial';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await getAdminCommercialOverview(50);
  return NextResponse.json(data);
}
