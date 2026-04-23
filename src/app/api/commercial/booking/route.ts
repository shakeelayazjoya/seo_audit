import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';

function getRequesterKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const rateLimit = await enforceRateLimit({
    key: session?.user.id ?? getRequesterKey(request),
    action: 'commercial_booking',
    limit: 8,
    windowMs: 1000 * 60 * 30,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many booking attempts. Please try later.' }, { status: 429 });
  }

  const calendlyUrl = process.env.CALENDLY_URL;
  if (!calendlyUrl) {
    return NextResponse.json({ error: 'Calendly is not configured' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const domain = typeof body.domain === 'string' ? body.domain : null;
  const auditId = typeof body.auditId === 'string' ? body.auditId : null;

  const record = await db.commercialRequest.create({
    data: {
      type: 'booking',
      provider: 'calendly',
      status: 'created',
      userId: session?.user.id ?? null,
      email: session?.user.email ?? null,
      domain,
      auditId,
      externalUrl: calendlyUrl,
    },
  });

  return NextResponse.json({
    url: calendlyUrl,
    requestId: record.id,
  });
}
