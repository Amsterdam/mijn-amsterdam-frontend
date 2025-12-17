import { describe, it, expect } from 'vitest';

import { camelizeKeys } from './helper';

describe('notifications.helper', () => {
  it('should camelize keys', () => {
    expect(camelizeKeys({ abc: true })).toHaveProperty('abc');
    expect(camelizeKeys({ a_b_c: true })).toHaveProperty('aBC');
    expect(camelizeKeys({ ab_bc: true })).toHaveProperty('abBc');
    expect(camelizeKeys({ ABCD: true })).toHaveProperty('ABCD');
    expect(camelizeKeys({ a__bc: true })).toHaveProperty('a_Bc');
    expect(camelizeKeys({ _bc: true })).toHaveProperty('Bc');
    expect(camelizeKeys({ ab_: true })).toHaveProperty('ab_');
  });

  it('should not keep uncamelized keys', () => {
    expect(camelizeKeys({ a_b_c: true })).not.toHaveProperty('a_b_c');
    expect(camelizeKeys({ ab_bc: true })).not.toHaveProperty('ab_bc');
  });

  it('should not camelize nested keys', () => {
    const objNested = { ab_cd: { bc_de: false } };
    expect(camelizeKeys(objNested).abCd).toHaveProperty('bc_de');
  });
});
