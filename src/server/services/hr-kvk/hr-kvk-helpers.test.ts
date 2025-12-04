import { describe, it, expect } from 'vitest';

import {
  getVestigingBagIds,
  normalizeDatePropertyNames,
  getPartialDateFormatted,
  getFullDate,
} from './hr-kvk-helpers';
import type { KvkResponseFrontend } from './hr-kvk.types';

describe('hr-kvk-helpers', () => {
  describe('getVestigingBagIds', () => {
    it('returns an empty array when kvkData is null', () => {
      const result = getVestigingBagIds(null);
      expect(result).toEqual([]);
    });

    it('filters and maps vestigingen with Amsterdam addresses and BAG IDs', () => {
      const mockKvkData = {
        vestigingen: [
          {
            bezoekadres: 'Amsterdam, Street 1',
            postadres: null,
            postHeeftBagNummeraanduidingId: '123',
            bezoekHeeftBagNummeraanduidingId: '456',
          },
          {
            bezoekadres: 'Rotterdam, Street 2',
            postadres: null,
            postHeeftBagNummeraanduidingId: null,
            bezoekHeeftBagNummeraanduidingId: null,
          },
        ],
      } as unknown as KvkResponseFrontend;

      const result = getVestigingBagIds(mockKvkData);
      expect(result).toHaveLength(1);
      expect(result[0].bagIds).toEqual(['123', '456']);
    });
  });

  describe('normalizeDatePropertyNames', () => {
    it('returns normalized date properties', () => {
      const input = {
        datumJaar: '2023',
        datumMaand: '10',
        datumDag: '15',
        datumDatum: null,
      };
      const result = normalizeDatePropertyNames('datum', input);
      expect(result).toEqual({
        jaar: '2023',
        maand: '10',
        dag: '15',
        datum: null,
      });
    });
    it('returns all date properties, even when supplied with partial input', () => {
      const input = {
        datumJaar: '2023',
        datumMaand: '10',
      };
      const result = normalizeDatePropertyNames('datum', input);
      expect(result).toEqual({
        jaar: '2023',
        maand: '10',
        dag: null,
        datum: null,
      });
    });

    it('returns default values when input is null', () => {
      const result = normalizeDatePropertyNames('datum', null);
      expect(result).toEqual({
        datum: null,
        jaar: null,
        maand: null,
        dag: null,
      });
    });
  });

  describe('getPartialDateFormatted', () => {
    it('formats a full date', () => {
      const input = { jaar: '2023', maand: '10', dag: '15', datum: null };
      const result = getPartialDateFormatted(input);
      expect(result).toBe('15 oktober 2023');
    });

    it('formats a year and month', () => {
      const input = { jaar: '2023', maand: '10', dag: null, datum: null };
      const result = getPartialDateFormatted(input);
      expect(result).toBe('Oktober 2023');
    });

    it('formats only a year', () => {
      const input = { jaar: '2023', maand: null, dag: null, datum: null };
      const result = getPartialDateFormatted(input);
      expect(result).toBe('Anno 2023');
    });

    it('returns null for empty input', () => {
      const input = { jaar: null, maand: null, dag: null, datum: null };
      const result = getPartialDateFormatted(input);
      expect(result).toBeNull();
    });
  });

  describe('getFullDate', () => {
    it('returns a full date string when all parts are present', () => {
      const input = { jaar: '2023', maand: '10', dag: '15', datum: null };
      const result = getFullDate(input);
      expect(result).toBe('2023-10-15');
    });

    it('returns the datum field if present', () => {
      const input = { jaar: null, maand: null, dag: null, datum: '2023-10-15' };
      const result = getFullDate(input);
      expect(result).toBe('2023-10-15');
    });

    it('returns null if any part is missing', () => {
      const input = { jaar: '2023', maand: '10', dag: null, datum: null };
      const result = getFullDate(input);
      expect(result).toBeNull();
    });

    it('returns null for null input', () => {
      const result = getFullDate(null);
      expect(result).toBeNull();
    });
  });
});
