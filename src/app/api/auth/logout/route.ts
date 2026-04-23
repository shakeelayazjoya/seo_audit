import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getSessionCookieName } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  if (token) {
    await destroySession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(getSessionCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
  return response;
}
