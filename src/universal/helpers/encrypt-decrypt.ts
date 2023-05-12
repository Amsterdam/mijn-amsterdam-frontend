import { Buffer } from 'buffer';
import crypto from 'crypto';

export function encrypt(plainText: string, encryptionKey: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

  return [
    Buffer.concat([iv, encrypted]).toString('base64url'),
    encrypted,
    iv,
  ] as const;
}

export function decrypt(encryptedValue: string, encryptionKey: string) {
  const keyBuffer = Buffer.from(encryptionKey);
  const decodedBuffer = Buffer.from(encryptedValue, 'base64');
  const ivBuffer = decodedBuffer.slice(0, 16);
  const dataBuffer = decodedBuffer.slice(16);

  const decipheriv = crypto.createDecipheriv(
    'aes-128-cbc',
    keyBuffer,
    ivBuffer
  );
  return decipheriv.update(dataBuffer).toString() + decipheriv.final('utf-8');
}
