import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, getSessionCookieName, hashPassword } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAppEvent } from '@/lib/monitoring';
import { getDatabaseErrorMessage } from '@/lib/db-errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      action: 'auth_signup',
      limit: 5,
      windowMs: 1000 * 60 * 30,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many signup attempts. Please try later.' }, { status: 429 });
    }

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const name = typeof body.name === 'string' ? body.name.trim() : null;

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (password.length < 10) {
      return NextResponse.json({ error: 'Password must be at least 10 characters' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Account already exists' }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        name,
      },
    });

    const session = await createSession(user.id);
    await logAppEvent({
      level: 'info',
      type: 'auth.signup',
      message: 'User signed up',
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
    console.error('[POST /api/auth/signup] Error:', error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 503 }
    );
  }
}
