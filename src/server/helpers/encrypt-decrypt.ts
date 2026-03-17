import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

import { IS_PRODUCTION } from '../../universal/config/env';
import { DecryptedPayloadAndSessionID } from '../services/shared/decrypt-route-param';

type Base64IvEncryptedValue = string;
type EncryptedValue = Buffer;
type Iv = Buffer;

const ENC_ALGO = 'aes-256-cbc';
const IV_BYTE_LENGTH = 16;

export function encrypt(
  plainText: string,
  encryptionKey: string | Buffer | undefined = process.env
    .BFF_GENERAL_ENCRYPTION_KEY
): [Base64IvEncryptedValue, EncryptedValue, Iv] {
  if (!encryptionKey) {
    throw new Error('Cannot encrypt, Encryption key not found.');
  }

  const iv = crypto.randomBytes(IV_BYTE_LENGTH);
  const cipher = crypto.createCipheriv(ENC_ALGO, encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

  return [Buffer.concat([iv, encrypted]).toString('base64url'), encrypted, iv];
}

export function decrypt(
  encryptedValue: string,
  encryptionKey: string | undefined = process.env.BFF_GENERAL_ENCRYPTION_KEY
) {
  if (!encryptionKey) {
    throw new Error('Cannot decrypt, Encryption key not found.');
  }

  const keyBuffer = Buffer.from(encryptionKey);
  const decodedBuffer = Buffer.from(encryptedValue, 'base64');
  const ivBuffer = Uint8Array.prototype.slice.call(
    decodedBuffer,
    0,
    IV_BYTE_LENGTH
  );
  const dataBuffer = Uint8Array.prototype.slice.call(
    decodedBuffer,
    IV_BYTE_LENGTH
  );

  const decipheriv = crypto.createDecipheriv(ENC_ALGO, keyBuffer, ivBuffer);
  return decipheriv.update(dataBuffer).toString() + decipheriv.final('utf-8');
}

export function encryptSessionIdWithRouteIdParam(
  sessionID: SessionID,
  routeIdParam: string
) {
  const [encrptedValue] = encrypt(`${sessionID}:${routeIdParam}`);
  return encrptedValue;
}

export function encryptPayloadAndSessionID<T extends Record<string, unknown>>(
  sessionID: SessionID,
  payload: T
) {
  const payloadToEncrypt: DecryptedPayloadAndSessionID<T> = {
    sessionID,
    payload,
  };
  const [encrptedValue] = encrypt(JSON.stringify(payloadToEncrypt));
  return encrptedValue;
}

/** IMPORTANT: Not entirely secure. Strongly prefer the encrypt function. Never expose these encrypted values in the UI or API. This function is only for internally used values that need to be deterministic. */
export function encryptDeterministic(
  plainText: string,
  encryptionKey: string | Buffer | undefined = process.env
    .BFF_GENERAL_ENCRYPTION_KEY,
  pepper: string | Buffer | undefined = process.env.BFF_GENERAL_HASH_PEPPER
): [Base64IvEncryptedValue, EncryptedValue, Iv] {
  if (IS_PRODUCTION) {
    throw new Error(
      'Preliminary implementation. Should not be used in production'
    );
  }
  if (!encryptionKey) {
    throw new Error('Cannot encrypt, Encryption key not found.');
  }
  if (!pepper) {
    throw new Error('Cannot encrypt, Pepper not found.');
  }

  const iv = crypto
    .createHash('sha256')
    .update(pepper)
    .update(plainText)
    .digest()
    .subarray(0, IV_BYTE_LENGTH);
  const cipher = crypto.createCipheriv(ENC_ALGO, encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

  return [Buffer.concat([iv, encrypted]).toString('base64url'), encrypted, iv];
}
