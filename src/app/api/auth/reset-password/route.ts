import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAppEvent } from '@/lib/monitoring';
import { hashPasswordResetToken } from '@/lib/password-reset';
import { getDatabaseErrorMessage } from '@/lib/db-errors';

function getRequesterKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await enforceRateLimit({
      key: getRequesterKey(request),
      action: 'auth_reset_password',
      limit: 8,
      windowMs: 1000 * 60 * 30,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many reset attempts. Please try later.' }, { status: 429 });
    }

    const body = await request.json();
    const token = String(body.token ?? '').trim();
    const password = String(body.password ?? '');

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }

    if (password.length < 10) {
      return NextResponse.json({ error: 'Password must be at least 10 characters' }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(token);
    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'This reset link is invalid or expired.' }, { status: 400 });
    }

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: hashPassword(password) },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      db.session.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    await logAppEvent({
      level: 'info',
      type: 'auth.password_reset_completed',
      message: 'User reset password',
      context: { userId: resetToken.userId, email: resetToken.user.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/auth/reset-password] Error:', error);
    return NextResponse.json({ error: getDatabaseErrorMessage(error) }, { status: 503 });
  }
}
