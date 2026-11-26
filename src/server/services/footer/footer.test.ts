import { describe, expect, test } from 'vitest';

import { getFooter } from './footer.ts';
import footerData from './footer-data.json' with { type: 'json' };

describe('footer', () => {
  test('getFooter returns the footer from footer-data.json', () => {
    expect(getFooter()).toEqual({ status: 'OK', content: footerData });
  });

  test('every link in footer-data.json has a label and url', () => {
    const links = [
      ...footerData.sections.flatMap((section) => section.links),
      ...footerData.bottomLinks,
    ];

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.label).not.toBe('');
      expect(link.url).not.toBe('');
    }
  });
});
