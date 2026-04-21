import { describe, it, expect } from 'vitest';

import * as zwdVve from './zwd.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

vi.mock('../bag/my-locations', () => ({
  fetchPrivate: vi.fn().mockResolvedValue({
    status: 'OK',
    content: [
      {
        bagAddress: {
          verblijfsobjectIdentificatie: 'xxx',
        },
      },
    ],
  }),
}));

describe('zwd-vve service', () => {
  describe('translateVerblijfObjectId', () => {
    it('should return the same BAGId if translations are not set', () => {
      expect(zwdVve.translateVerblijfObjectId('0363010000801903')).toBe(
        '0363010000801903'
      );
    });
    it('should translate BAGId if translations are set', () => {
      const envValue = process.env.BFF_BAG_TRANSLATIONS;
      process.env.BFF_BAG_TRANSLATIONS =
        '123456789=987654321,111111111=222222222';
      expect(zwdVve.translateVerblijfObjectId('123456789')).toBe('987654321');
      expect(zwdVve.translateVerblijfObjectId('111111111')).toBe('222222222');

      process.env.BFF_BAG_TRANSLATIONS = envValue;
    });
  });

  describe('fetchVVEData', () => {
    it('should fetch VVE data', async () => {
      remoteApi.get(/mijn-amsterdam/).reply(200, {
        name: 'VvE Test',
      });
      const response = await zwdVve.fetchVVEData(getAuthProfileAndToken());
      expect(response).toEqual({
        content: {
          name: 'VvE Test',
        },
        status: 'OK',
      });
    });
    it('should handle VVE data not found', async () => {
      remoteApi.get(/mijn-amsterdam/).reply(404, {
        name: 'VvE Test',
      });
      const response = await zwdVve.fetchVVEData(getAuthProfileAndToken());
      expect(response).toEqual({
        content: null,
        status: 'OK',
      });
    });
  });
});
