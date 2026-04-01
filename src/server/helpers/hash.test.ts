import { afterEach, describe, expect, it, vi } from 'vitest';

import { hashWithPepper } from './hash.ts';

describe('hashWithPepper', () => {
  const plainText = 'hello world';
  const pepper = Buffer.from('unit-test-pepper');

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns deterministic output for identical inputs', () => {
    const encoded1 = hashWithPepper(plainText, pepper);
    const encoded2 = hashWithPepper(plainText, pepper);

    expect(encoded2).toEqual(encoded1);
  });

  it('changes output when plaintext changes', () => {
    const encodedA = hashWithPepper('a', pepper);
    const encodedB = hashWithPepper('b', pepper);

    expect(encodedA).not.toEqual(encodedB);
  });

  it('changes output when pepper changes', () => {
    const encodedA = hashWithPepper(plainText, Buffer.from('pepper-a'));
    const encodedB = hashWithPepper(plainText, Buffer.from('pepper-b'));

    expect(encodedA).not.toEqual(encodedB);
  });

  it('throws when pepper is missing', () => {
    vi.stubEnv('BFF_GENERAL_HASH_PEPPER', '');
    expect(() => hashWithPepper(plainText)).toThrow(/Pepper not found/i);
  });
});
