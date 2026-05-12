import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAppEvent } from '@/lib/monitoring';
import { sendEmail } from '@/lib/email';
import { buildPasswordResetEmail } from '@/lib/email-templates';
import {
  createPasswordResetToken,
  getPasswordResetExpiry,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from '@/lib/password-reset';
import { getDatabaseErrorMessage } from '@/lib/db-errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequesterKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

function getAppUrl(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  console.warn('[getAppUrl] Missing x-forwarded-proto or x-forwarded-host headers, falling back to request URL or environment variable');
  console.log("Next URL:", request.nextUrl.href, "Environment URL:", process.env.NEXT_PUBLIC_APP_URL);

  if (request.nextUrl.host) {
    return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await enforceRateLimit({
      key: getRequesterKey(request),
      action: 'auth_forgot_password',
      limit: 5,
      windowMs: 1000 * 60 * 30,
    });

    // if (!rateLimit.allowed) {
    //   return NextResponse.json({ error: 'Too many reset requests. Please try later.' }, { status: 429 });
    // }

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = createPasswordResetToken();
      const expiresAt = getPasswordResetExpiry();

      await db.$transaction([
        db.passwordResetToken.updateMany({
          where: {
            userId: user.id,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { usedAt: new Date() },
        }),
        db.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: resetToken.tokenHash,
            expiresAt,
          },
        }),
      ]);

      const resetUrl = `${getAppUrl(request)}/reset-password?token=${encodeURIComponent(resetToken.token)}`;
      const emailContent = buildPasswordResetEmail({
        resetUrl,
        recipientEmail: email,
        expiresInMinutes: Math.round(PASSWORD_RESET_TOKEN_TTL_MS / 60000),
      });
      const delivery = await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      await logAppEvent({
        level: delivery.success ? 'info' : 'warn',
        type: 'auth.password_reset_requested',
        message: delivery.success ? 'Password reset email sent' : 'Password reset email skipped',
        context: {
          userId: user.id,
          email,
          provider: delivery.provider,
          skippedReason: delivery.skippedReason ?? null,
        },
      });
    } else {
      await logAppEvent({
        level: 'warn',
        type: 'auth.password_reset_unknown_email',
        message: 'Password reset requested for unknown email',
        context: { email },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[POST /api/auth/forgot-password] Error:', error);
    return NextResponse.json({ error: getDatabaseErrorMessage(error) }, { status: 503 });
  }
}
