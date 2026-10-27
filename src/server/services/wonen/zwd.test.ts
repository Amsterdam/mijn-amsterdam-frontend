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
          cases: [],
        },
        status: 'OK',
      });
    });
    it('should not expose cases created before 2023-01-01', async () => {
      remoteApi.get(/mijn-amsterdam/).reply(200, {
        name: 'VvE Test',
        cases: [
          {
            id: 'ZWD-OLD',
            created: '2022-12-31T23:59:59.000Z',
            updated: '2023-01-02T09:00:00.000Z',
            status: 'In behandeling',
            advice_type: 'Verduurzamingsadvies',
            homeowner_association: { name: 'VvE Test' },
            prefixed_dossier_id: 'ZWD-OLD',
          },
          {
            id: 'ZWD-NEW',
            created: '2023-01-01T00:00:00.000Z',
            updated: '2023-01-02T09:00:00.000Z',
            status: 'In behandeling',
            advice_type: 'Verduurzamingsadvies',
            homeowner_association: { name: 'VvE Test' },
            prefixed_dossier_id: 'ZWD-NEW',
          },
        ],
      });

      const response = await zwdVve.fetchVVEData(getAuthProfileAndToken());

      expect(response.status).toBe('OK');
      expect(response.content?.cases.map(({ id }) => id)).toEqual(['ZWD-NEW']);
    });
    it('should handle VVE data not found', async () => {
      remoteApi.get(/mijn-amsterdam/).reply(404, {
        name: 'VvE Test',
        cases: [],
      });
      const response = await zwdVve.fetchVVEData(getAuthProfileAndToken());
      expect(response).toEqual({
        content: null,
        status: 'OK',
      });
    });
  });
});
