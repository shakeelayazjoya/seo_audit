import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, getSessionCookieName, verifyPassword } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAppEvent } from '@/lib/monitoring';
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
      action: 'auth_login',
      limit: 10,
      windowMs: 1000 * 60 * 30,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Please try later.' }, { status: 429 });
    }

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      await logAppEvent({
        level: 'warn',
        type: 'auth.login_failed',
        message: 'Invalid login attempt',
        context: { email },
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const session = await createSession(user.id);
    await logAppEvent({
      level: 'info',
      type: 'auth.login',
      message: 'User logged in',
      context: { userId: user.id, email: user.email },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    response.cookies.set(getSessionCookieName(), session.sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: session.expiresAt,
    });
    return response;
  } catch (error) {
    console.error('[POST /api/auth/login] Error:', error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 503 }
    );
  }
}
