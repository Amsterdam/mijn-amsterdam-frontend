import { afterEach, describe, expect, it, vi } from 'vitest';

import { decrypt, encryptDeterministic } from './encrypt-decrypt.ts';

describe('encryptDeterministic', () => {
  const encryptionKey = Buffer.alloc(32, 0).toString(); // 32 bytes for aes-256-cbc
  const plainText = 'hello world';
  const pepper = Buffer.from('unit-test-pepper');

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns deterministic output that can be decrypted', () => {
    const [encoded1, _, __] = encryptDeterministic(
      plainText,
      encryptionKey,
      pepper
    );

    expect(encoded1).not.toBe(plainText);
    expect(plainText).toBe(decrypt(encoded1, encryptionKey));
  });

  it('returns deterministic output for identical inputs', () => {
    const [encoded1] = encryptDeterministic(plainText, encryptionKey, pepper);
    const [encoded2] = encryptDeterministic(plainText, encryptionKey, pepper);

    expect(encoded2).toEqual(encoded1);
  });

  it('changes output when plaintext changes', () => {
    const [encodedA] = encryptDeterministic('a', encryptionKey, pepper);
    const [encodedB] = encryptDeterministic('b', encryptionKey, pepper);

    expect(encodedA).not.toEqual(encodedB);
  });

  it('changes output when encryptionKey changes', () => {
    const [encodedA] = encryptDeterministic(
      plainText,
      Buffer.alloc(32, 0).toString(),
      pepper
    );
    const [encodedB] = encryptDeterministic(
      plainText,
      Buffer.alloc(32, 1).toString(),
      pepper
    );

    expect(encodedA).not.toEqual(encodedB);
  });

  it('changes output when pepper changes', () => {
    const [encodedA] = encryptDeterministic(
      plainText,
      encryptionKey,
      Buffer.from('pepper-a')
    );
    const [encodedB] = encryptDeterministic(
      plainText,
      encryptionKey,
      Buffer.from('pepper-b')
    );

    expect(encodedA).not.toEqual(encodedB);
  });

  it('throws when encryption key is missing', () => {
    vi.stubEnv('BFF_GENERAL_ENCRYPTION_KEY', '');
    expect(() => encryptDeterministic(plainText)).toThrow(
      /Encryption key not found/i
    );
  });

  it('throws when pepper is missing', () => {
    vi.stubEnv('BFF_GENERAL_HASH_PEPPER', '');
    expect(() => encryptDeterministic(plainText, encryptionKey)).toThrow(
      /Pepper not found/i
    );
  });
});
