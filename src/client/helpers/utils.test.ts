import { isExternalUrl, isInteralUrl } from './utils';

describe('utils', () => {
  it('isInternalUrl: Should check if url is external', () => {
    expect(isInteralUrl('http://example.org')).toBe(false);
    expect(isInteralUrl('http://mijn.amsterdam.nl')).toBe(true);
  });

  it('isExternalUrl: Should check if url is external', () => {
    expect(isExternalUrl('http://example.org')).toBe(true);
    expect(isExternalUrl('http://mijn.amsterdam.nl')).toBe(false);
  });
});
