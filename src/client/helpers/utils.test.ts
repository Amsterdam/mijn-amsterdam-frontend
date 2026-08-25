import { createElement } from 'react';

import { isExternalUrl, isInteralUrl, isLinkLikeElement } from './utils.ts';

describe('utils', () => {
  it('isInternalUrl: Should check if url is external', () => {
    expect(isInteralUrl('http://example.org')).toBe(false);
    expect(isInteralUrl('http://mijn.amsterdam.nl')).toBe(true);
  });

  it('isExternalUrl: Should check if url is external', () => {
    expect(isExternalUrl('http://example.org')).toBe(true);
    expect(isExternalUrl('http://mijn.amsterdam.nl')).toBe(false);
  });

  it('isLinkLikeElement: Should return true for elements with string href and child', () => {
    const element = createElement('a', { href: '/zaak/1' }, 'Bekijk zaak');

    expect(isLinkLikeElement(element)).toBe(true);
  });

  it('isLinkLikeElement: Should return false when href is missing', () => {
    const element = createElement('span', null, 'Geen link');

    expect(isLinkLikeElement(element)).toBe(false);
  });

  it('isLinkLikeElement: Should return false when child is missing', () => {
    const element = createElement('a', { href: '/zaak/1' });

    expect(isLinkLikeElement(element)).toBe(false);
  });

  it('isLinkLikeElement: Should return false when href is not a string', () => {
    const element = createElement('a', { href: 123 as unknown as string }, 'Bekijk zaak');

    expect(isLinkLikeElement(element)).toBe(false);
  });
});
