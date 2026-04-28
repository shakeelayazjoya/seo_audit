import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import {
  buildContactConfirmationEmail,
  buildContactInquiryAdminEmail,
} from '@/lib/email-templates';
import { logAppEvent } from '@/lib/monitoring';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequesterKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

function getContactInbox() {
  return process.env.CONTACT_INBOX?.trim() || process.env.SMTP_USER?.trim() || process.env.EMAIL_FROM?.trim() || '';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const rateLimit = await enforceRateLimit({
      key: session?.user.id ?? getRequesterKey(request),
      action: 'contact_form',
      limit: 10,
      windowMs: 1000 * 60 * 30,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many contact requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const phone = String(body.phone ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!name || !EMAIL_REGEX.test(email) || !phone || message.length < 10) {
      return NextResponse.json(
        { error: 'Name, valid email, phone number, and a message are required.' },
        { status: 400 }
      );
    }

    const record = await db.commercialRequest.create({
      data: {
        type: 'contact',
        provider: 'website',
        status: 'received',
        userId: session?.user.id ?? null,
        email,
        payload: {
          name,
          phone,
          message,
        },
      },
    });

    const inbox = getContactInbox();
    let adminDelivery = null;
    let userDelivery = null;

    if (inbox) {
      const adminEmail = buildContactInquiryAdminEmail({ name, email, phone, message });
      adminDelivery = await sendEmail({
        to: inbox,
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
        replyTo: email,
      });
    }

    const confirmationEmail = buildContactConfirmationEmail({ name });
    userDelivery = await sendEmail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
      text: confirmationEmail.text,
    });

    await logAppEvent({
      level: 'info',
      type: 'contact.submitted',
      message: 'Contact form submitted',
      context: {
        requestId: record.id,
        userId: session?.user.id ?? null,
        userEmail: email,
        adminDelivery,
        userDelivery,
      },
    });

    return NextResponse.json({
      success: true,
      requestId: record.id,
      adminDelivery,
      userDelivery,
    });
  } catch (error) {
    console.error('[POST /api/contact] Error:', error);
    return NextResponse.json({ error: 'Unable to send contact request right now.' }, { status: 500 });
  }
}
