import crypto from 'node:crypto';

export function hashWithPepper(
  plainText: string,
  pepper: string | Buffer | undefined = process.env.BFF_GENERAL_HASH_PEPPER
): string {
  if (!pepper) {
    throw new Error('Cannot hash, Pepper not found.');
  }

  return crypto
    .createHmac('sha256', pepper)
    .update(plainText)
    .digest('base64url');
}
