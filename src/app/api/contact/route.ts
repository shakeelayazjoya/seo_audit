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
const PHONE_REGEX = /^[+()\-\s\d]{7,20}$/;
const CONTACT_EMAIL_TIMEOUT_MS = 8000;

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

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function sendEmailWithTimeout(
  label: 'admin' | 'user',
  operation: Promise<Awaited<ReturnType<typeof sendEmail>>>
) {
  const timeout = new Promise<Awaited<ReturnType<typeof sendEmail>>>((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve({
        success: false,
        provider: 'timeout',
        skippedReason: `${label} email timed out after ${CONTACT_EMAIL_TIMEOUT_MS}ms.`,
      });
    }, CONTACT_EMAIL_TIMEOUT_MS);
  });

  return Promise.race([operation, timeout]);
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
    const name = readString(body.name);
    const email = readString(body.email).toLowerCase();
    const phone = readString(body.phone ?? body.phoneNumber ?? body.phonenumber ?? body.mobile);
    const message = readString(body.message ?? body.description ?? body.note ?? body.notes);
    const normalizedPhone = phone.replace(/\s+/g, ' ').trim();
    const errors: string[] = [];

    if (!name) {
      errors.push('Name is required.');
    }

    if (!EMAIL_REGEX.test(email)) {
      errors.push('A valid email is required.');
    }

    if (!normalizedPhone) {
      errors.push('Phone number is required.');
    } else if (!PHONE_REGEX.test(normalizedPhone)) {
      errors.push('Phone number format looks invalid.');
    }

    if (!message) {
      errors.push('Message is required.');
    } else if (message.length < 10) {
      errors.push('Message must be at least 10 characters.');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: errors[0],
          errors,
        },
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
          phone: normalizedPhone,
          message,
        },
      },
    });

    const inbox = getContactInbox();
    const emailJobs: Array<{
      target: 'admin' | 'user';
      job: Promise<Awaited<ReturnType<typeof sendEmail>>>;
    }> = [];

    if (inbox) {
      const adminEmail = buildContactInquiryAdminEmail({ name, email, phone: normalizedPhone, message });
      emailJobs.push({
        target: 'admin',
        job: sendEmailWithTimeout(
          'admin',
          sendEmail({
            to: inbox,
            subject: adminEmail.subject,
            html: adminEmail.html,
            text: adminEmail.text,
            replyTo: email,
          })
        ),
      });
    }

    const confirmationEmail = buildContactConfirmationEmail({ name });
    emailJobs.push({
      target: 'user',
      job: sendEmailWithTimeout(
        'user',
        sendEmail({
          to: email,
          subject: confirmationEmail.subject,
          html: confirmationEmail.html,
          text: confirmationEmail.text,
        })
      ),
    });

    const emailResults = await Promise.allSettled(emailJobs.map((entry) => entry.job));
    const adminResultIndex = emailJobs.findIndex((entry) => entry.target === 'admin');
    const userResultIndex = emailJobs.findIndex((entry) => entry.target === 'user');
    const adminDeliveryResult = adminResultIndex >= 0 ? emailResults[adminResultIndex] : null;
    const userDeliveryResult = userResultIndex >= 0 ? emailResults[userResultIndex] : null;
    const adminDelivery =
      adminDeliveryResult?.status === 'fulfilled'
        ? adminDeliveryResult.value
        : adminDeliveryResult
          ? {
              success: false,
              provider: 'error',
              skippedReason: 'Admin email failed to send.',
            }
          : {
              success: false,
              provider: 'skipped',
              skippedReason: 'CONTACT_INBOX is not configured.',
            };
    const userDelivery =
      userDeliveryResult?.status === 'fulfilled'
        ? userDeliveryResult.value
        : {
            success: false,
            provider: 'error',
            skippedReason: 'Confirmation email failed to send.',
          };

    await logAppEvent({
      level: adminDelivery.success || userDelivery.success ? 'info' : 'warn',
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
