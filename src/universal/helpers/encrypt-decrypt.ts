import { Buffer } from 'buffer';
import crypto from 'crypto';

console.log(crypto.getCiphers());

type Base64IvEncryptedValue = string;
type EncryptedValue = Buffer;
type Iv = Buffer;

export function encrypt(
  plainText: string,
  encryptionKey: string
): [Base64IvEncryptedValue, EncryptedValue, Iv] {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

  return [Buffer.concat([iv, encrypted]).toString('base64url'), encrypted, iv];
}

export function decrypt(encryptedValue: string, encryptionKey: string) {
  const keyBuffer = Buffer.from(encryptionKey);
  const decodedBuffer = Buffer.from(encryptedValue, 'base64');
  const ivBuffer = decodedBuffer.slice(0, 16);
  const dataBuffer = decodedBuffer.slice(16);

  const decipheriv = crypto.createDecipheriv(
    'aes-256-cbc',
    keyBuffer,
    ivBuffer
  );
  return decipheriv.update(dataBuffer).toString() + decipheriv.final('utf-8');
}
