import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { buildCalendlyBookingUrl } from '@/lib/commercial';
import { buildBookingConfirmationEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';
import { logAppEvent } from '@/lib/monitoring';

function getRequesterKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    if (!calendlyUrl) {
      return NextResponse.json({ error: 'Calendly is not configured' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const domain = typeof body.domain === 'string' ? body.domain : null;
    const auditId = typeof body.auditId === 'string' ? body.auditId : null;
    const bookingUrl = buildCalendlyBookingUrl({
      calendlyUrl,
      email: session?.user.email ?? null,
      name: session?.user.name ?? null,
      domain,
    });

    const record = await db.commercialRequest.create({
      data: {
        type: 'booking',
        provider: 'calendly',
        status: 'pending_booking',
        userId: session?.user.id ?? null,
        email: session?.user.email ?? null,
        domain,
        auditId,
        externalUrl: bookingUrl,
      },
    });

    let emailDelivery: { success: boolean; provider: string; skippedReason?: string | null } | null = null;
    if (session?.user.email) {
      const email = buildBookingConfirmationEmail({
        recipientEmail: session.user.email,
        domain,
        bookingUrl: `${appUrl}/book/strategy/${record.id}`,
      });
      emailDelivery = await sendEmail({
        to: session.user.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    }

    await logAppEvent({
      level: emailDelivery?.success === false ? 'warn' : 'info',
      type: 'commercial.booking_created',
      message: 'Strategy booking flow created',
      context: {
        requestId: record.id,
        domain,
        auditId,
        emailDelivery,
      },
    });

    return NextResponse.json({
      url: `${appUrl}/book/strategy/${record.id}`,
      requestId: record.id,
      bookingUrl,
      emailDelivery,
    });
  } catch (error) {
    console.error('[POST /api/commercial/booking] Error:', error);
    return NextResponse.json({ error: 'Unable to create booking flow' }, { status: 500 });
  }
}
