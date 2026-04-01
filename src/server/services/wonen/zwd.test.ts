import { describe, it, expect, beforeEach } from 'vitest';

import * as zwdVve from './zwd';

// Mock dependencies if any (adjust as needed)
// For example, if zwd-vve.ts imports other modules, mock them here

describe('zwd-vve service', () => {
  beforeEach(() => {
    // Reset mocks or setup before each test if needed
  });

  describe('translateBSN', () => {
    it('should return the same BAGId if translations are not set', () => {
      expect(zwdVve.translateVerblijfObject('0363010000801903')).toBe(
        '0363010000801903'
      );
    });
    it('should translate BAGId if translations are set', () => {
      const envValue = process.env.BFF_BAG_TRANSLATIONS;
      process.env.BFF_BAG_TRANSLATIONS =
        '123456789=987654321,111111111=222222222';
      expect(zwdVve.translateVerblijfObject('123456789')).toBe('987654321');
      expect(zwdVve.translateVerblijfObject('111111111')).toBe('222222222');

      process.env.BFF_BAG_TRANSLATIONS = envValue;
    });
  });
});
