import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';

import { forTesting, fetchBrpByBsn } from './brp';
import { getFromEnv } from '../../helpers/env';
import { requestData } from '../../helpers/source-api-request';
import { fetchAuthTokenHeader } from '../ms-oauth/oauth-token';

const {
  fetchBenkBrpTokenHeader,
  getDatum,
  transformBenkBrpResponse,
  translateBSN,
} = forTesting;

vi.mock('../../helpers/env', () => ({
  getFromEnv: vi.fn(),
}));

vi.mock('../ms-oauth/oauth-token', () => ({
  fetchAuthTokenHeader: vi.fn(),
}));

vi.mock('../../helpers/source-api-request', () => ({
  requestData: vi.fn(),
}));

describe('brp.ts', () => {
  afterAll(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe('fetchBenkBrpTokenHeader', () => {
    it('should call fetchAuthTokenHeader with correct parameters', () => {
      (getFromEnv as Mock).mockImplementation((key: string) => {
        const env = {
          BFF_BENK_BRP_CLIENT_ID: 'test-client-id',
          BFF_BENK_BRP_CLIENT_SECRET: 'test-client-secret',
          BFF_BENK_BRP_TENANT: 'test-tenant',
          BFF_BENK_BRP_APPLICATION_ID: 'test-app-id',
        };
        return env[key];
      });

      fetchBenkBrpTokenHeader();

      expect(fetchAuthTokenHeader).toHaveBeenCalledWith(
        {
          apiKey: 'BRP',
          tokenValidityMS: expect.any(Number),
        },
        {
          clientID: 'test-client-id',
          clientSecret: 'test-client-secret',
          tenantID: 'test-tenant',
          scope: 'test-app-id/.default',
        }
      );
    });
  });

  describe('getDatum', () => {
    it('should return null for undefined datum', () => {
      expect(getDatum(undefined)).toBeNull();
    });

    it('should return formatted date for JaarDatum', () => {
      expect(
        getDatum({
          type: 'JaarDatum',
          jaar: '2023',
          langFormaat: '',
        })
      ).toBe('2023-01-01');
    });

    it('should return formatted date for JaarMaandDatum', () => {
      expect(
        getDatum({
          type: 'JaarMaandDatum',
          jaar: '2023',
          maand: '5',
          langFormaat: '',
        })
      ).toBe('2023-05-01');
    });

    it('should return date for Datum', () => {
      expect(
        getDatum({
          type: 'Datum',
          datum: '2023-05-15',
          langFormaat: '',
        })
      ).toBe('2023-05-15');
    });

    it('should return null for DatumOnbekend', () => {
      expect(
        getDatum({
          type: 'DatumOnbekend',
          langFormaat: '',
          onbekend: true,
        })
      ).toBeNull();
    });
  });

  describe('transformBenkBrpResponse', () => {
    it('should throw an error if no person is found in response', () => {
      expect(() =>
        transformBenkBrpResponse({
          personen: [],
          type: '',
        })
      ).toThrow('No person found in Benk BRP response');
    });

    it('should transform response data correctly', () => {
      const responseData = {
        personen: [
          {
            naam: { volledigeNaam: 'John Doe' },
            verblijfplaats: { type: 'VerblijfplaatsOnbekend' },
            gemeenteVanInschrijving: { code: '0363' },
          },
        ],
      };

      const result = transformBenkBrpResponse(responseData as any);
      expect(result).toHaveProperty('persoon.opgemaakteNaam', 'John Doe');
      expect(result).toHaveProperty('persoon.vertrokkenOnbekendWaarheen', true);
      expect(result).toHaveProperty('persoon.mokum', true);
    });
  });

  describe('translateBSN', () => {
    it('should return the same BSN if translations are not set', () => {
      (getFromEnv as Mock).mockReturnValue(null);
      expect(translateBSN('123456789')).toBe('123456789');
    });

    it('should translate BSN if translations are set', () => {
      (getFromEnv as Mock).mockReturnValue('123456789=987654321');
      expect(translateBSN('123456789')).toBe('987654321');
    });
  });

  describe('fetchBrpByBsn', () => {
    it('should call requestData with correct parameters', async () => {
      (fetchAuthTokenHeader as Mock).mockResolvedValue({
        status: 'OK',
        content: { Authorization: 'Bearer test-token' },
      });

      (requestData as Mock).mockResolvedValue({ data: 'test-data' });

      const result = await fetchBrpByBsn('test-session-id', ['123456789']);

      expect(fetchAuthTokenHeader).toHaveBeenCalled();
      expect(requestData).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'X-Correlation-ID': 'fetch-brp-test-session-id',
          }),
        })
      );
      expect(result).toEqual({ data: 'test-data' });
    });

    it('should return response if fetchAuthTokenHeader fails', async () => {
      (fetchAuthTokenHeader as Mock).mockResolvedValue({ status: 'ERROR' });

      const result = await fetchBrpByBsn('test-session-id', ['123456789']);
      expect(result).toEqual({ status: 'ERROR' });
    });
  });
});
