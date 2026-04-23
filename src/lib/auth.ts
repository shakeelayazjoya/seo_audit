import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { db } from './db';

const SESSION_COOKIE = 'seo_audit_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

function derivePasswordHash(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, 64) as Buffer;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = derivePasswordHash(password, salt);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;
  const derived = derivePasswordHash(password, Buffer.from(saltHex, 'hex'));
  return timingSafeEqual(derived, Buffer.from(hashHex, 'hex'));
}

export async function createSession(userId: string) {
  const sessionToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: {
      sessionToken,
      userId,
      expiresAt,
    },
  });

  return { sessionToken, expiresAt };
}

export async function destroySession(sessionToken: string) {
  await db.session.deleteMany({
    where: { sessionToken },
  });
}

export async function getSessionFromRequest(request?: NextRequest) {
  const token = request?.cookies.get(SESSION_COOKIE)?.value ?? (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await destroySession(token);
    return null;
  }

  return session;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
