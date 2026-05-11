import { createHash, randomBytes } from 'node:crypto';

const RESET_TOKEN_BYTES = 32;
export const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

export function createPasswordResetToken() {
  const token = randomBytes(RESET_TOKEN_BYTES).toString('base64url');
  return {
    token,
    tokenHash: hashPasswordResetToken(token),
  };
}

export function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getPasswordResetExpiry() {
  return new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
}
