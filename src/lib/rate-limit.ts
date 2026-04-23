import { db } from './db';

export async function enforceRateLimit(input: {
  key: string;
  action: string;
  limit: number;
  windowMs: number;
}) {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / input.windowMs) * input.windowMs);
  const expiresAt = new Date(windowStart.getTime() + input.windowMs);

  const existing = await db.rateLimitBucket.findUnique({
    where: {
      key_action_windowStart: {
        key: input.key,
        action: input.action,
        windowStart,
      },
    },
  });

  if (!existing) {
    await db.rateLimitBucket.create({
      data: {
        key: input.key,
        action: input.action,
        windowStart,
        expiresAt,
        count: 1,
      },
    });
    return { allowed: true, remaining: input.limit - 1, resetAt: expiresAt };
  }

  if (existing.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.expiresAt };
  }

  const updated = await db.rateLimitBucket.update({
    where: { id: existing.id },
    data: {
      count: { increment: 1 },
    },
  });

  return {
    allowed: true,
    remaining: Math.max(0, input.limit - updated.count),
    resetAt: updated.expiresAt,
  };
}
