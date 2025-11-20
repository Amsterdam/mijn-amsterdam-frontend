import { describe, it, expect, vi } from 'vitest';

import { fetchKVK, forTesting } from './hr-kvk';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';

const mocks = vi.hoisted(() => {
  return {
    IS_PRODUCTION: false,
  };
});

vi.mock('../../../universal/config/env', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    get IS_PRODUCTION() {
      return mocks.IS_PRODUCTION;
    },
  };
});

describe('hr-kvk module', () => {
  describe('translateKVKNummer', () => {
    const originalValue = process.env.BFF_HR_KVK_KVKNUMMER_TRANSLATIONS;
    process.env.BFF_HR_KVK_KVKNUMMER_TRANSLATIONS = '12345678=87654321';

    afterAll(() => {
      process.env.BFF_HR_KVK_KVKNUMMER_TRANSLATIONS = originalValue;
    });

    it('returns the same KVK number in production', () => {
      mocks.IS_PRODUCTION = true;
      const result = forTesting.translateKVKNummer('12345678');
      expect(result).toBe('12345678');
      mocks.IS_PRODUCTION = false;
    });

    it('returns another KVK number in non-production', () => {
      const result = forTesting.translateKVKNummer('12345678');
      expect(result).toBe('87654321');
    });
  });

  describe('normalizeDate', () => {
    it('normalizes date fields by removing the prefix', () => {
      const input = {
        datumJaar: '2023',
        datumMaand: '10',
        datumDag: '15',
      };
      const result = forTesting.normalizeDate('datum', input);
      expect(result).toEqual({ jaar: '2023', maand: '10', dag: '15' });
    });
  });

  describe('getDate', () => {
    it('returns a formatted date string when all fields are present', () => {
      const input = {
        datumJaar: '2023',
        datumMaand: '10',
        datumDag: '15',
      };
      const result = forTesting.getDate('datum', input);
      expect(result).toBe('2023-10-15');
    });

    it('returns null when fields are missing', () => {
      const input = { datumJaar: '2023' };
      const result = forTesting.getDate('datum', input);
      expect(result).toBeNull();
    });
  });

  describe('fetchKVK', () => {
    it('returns an error when both MAC and vestigingen requests fail', async () => {
      vi.mocked(Promise.allSettled).mockResolvedValueOnce([
        { status: 'rejected', reason: 'Error' },
        { status: 'rejected', reason: 'Error' },
      ]);

      const result = await fetchKVK(getAuthProfileAndToken('commercial'));

      expect(result).toEqual(apiErrorResult('Failed to fetch KVK data', null));
    });

    it('returns a successful response when at least one request succeeds', async () => {
      vi.mocked(Promise.allSettled).mockResolvedValueOnce([
        { status: 'fulfilled', value: apiSuccessResult([{ id: 1 }]) },
        { status: 'fulfilled', value: apiSuccessResult({ onderneming: {} }) },
      ]);

      const result = await fetchKVK(getAuthProfileAndToken('commercial'));

      expect(result.status).toBe('OK');
      expect(result.content).toHaveProperty('onderneming');
      expect(result.content).toHaveProperty('vestigingen');
    });
  });

  describe('transformMAC', () => {
    it('transforms MAC response data correctly', () => {
      const mockMACResponse = {
        _embedded: {
          maatschappelijkeactiviteiten: [
            {
              naam: 'Test Company',
              handelsnamen: [{ handelsnaam: 'Test Handelsnaam' }],
              activiteiten: [
                { omschrijving: 'Hoofdactiviteit', isHoofdactiviteit: true },
                { omschrijving: 'Overige activiteit' },
              ],
              kvknummer: '12345678',
            },
          ],
          heeftAlsEigenaarHrNnp: [{ naam: 'Test Owner', rechtsvorm: 'BV' }],
        },
      };

      const result = forTesting.transformMAC(mockMACResponse);
      expect(result.onderneming).toHaveProperty('handelsnaam', 'Test Company');
      expect(result.onderneming).toHaveProperty('kvknummer', '12345678');
      expect(result.eigenaar).toHaveProperty('naam', 'Test Owner');
    });
  });
});
