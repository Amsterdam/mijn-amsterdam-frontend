import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';

import { forTesting, fetchBrpByBsn, fetchBrpByBsnTransformed } from './brp';
import testPersonenResponse from '../../../../mocks/fixtures/brp/test-personen.json';
import verblijfplaatsenResponse from '../../../../mocks/fixtures/brp/verblijfplaatshistorie.json';
import { remoteApi } from '../../../testing/utils';
import { fetchAuthTokenHeader } from '../ms-oauth/oauth-token';

const {
  fetchBenkBrpTokenHeader,
  getDatum,
  transformBenkBrpResponse,
  translateBSN,
} = forTesting;

vi.mock('../ms-oauth/oauth-token', () => ({
  fetchAuthTokenHeader: vi.fn(),
}));

describe('brp.ts', () => {
  afterAll(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe('fetchBenkBrpTokenHeader', () => {
    it('should call fetchAuthTokenHeader with correct parameters', () => {
      fetchBenkBrpTokenHeader();

      expect(fetchAuthTokenHeader).toHaveBeenCalledWith(
        {
          sourceApiName: 'BRP',
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
          jaar: 2023,
          langFormaat: '',
        })
      ).toBe('2023-01-01');
    });

    it('should return formatted date for JaarMaandDatum', () => {
      expect(
        getDatum({
          type: 'JaarMaandDatum',
          jaar: 2023,
          maand: 5,
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

      const result = transformBenkBrpResponse(responseData.personen[0] as any);
      expect(result).toHaveProperty('persoon.opgemaakteNaam', 'John Doe');
      expect(result).toHaveProperty('persoon.vertrokkenOnbekendWaarheen', true);
      expect(result).toHaveProperty('persoon.mokum', true);
    });
  });

  describe('translateBSN', () => {
    it('should return the same BSN if translations are not set', () => {
      expect(translateBSN('123456789')).toBe('123456789');
    });

    it('should translate BSN if translations are set', () => {
      const envValue = process.env.BFF_BENK_BSN_TRANSLATIONS;
      process.env.BFF_BENK_BSN_TRANSLATIONS =
        '123456789=987654321,111111111=222222222';
      expect(translateBSN('123456789')).toBe('987654321');
      expect(translateBSN('111111111')).toBe('222222222');

      process.env.BFF_BENK_BSN_TRANSLATIONS = envValue;
    });
  });

  describe('fetchBrpByBsn', () => {
    it('should return response if fetchAuthTokenHeader fails', async () => {
      (fetchAuthTokenHeader as Mock).mockResolvedValue({ status: 'ERROR' });

      const result = await fetchBrpByBsn('test-session-id', ['123456789']);
      expect(result).toEqual({ status: 'ERROR' });
    });

    describe('Should format response data correctly', () => {
      test('Formatting for test BSN 1, with verblijfplaatshistorie', async () => {
        vi.unmock('../../helpers/source-api-request');

        (fetchAuthTokenHeader as Mock).mockResolvedValue({
          content: { Authorization: 'Bearer test-token' },
          status: 'OK',
        });

        const BSN = '999971074';
        const testPersoon = testPersonenResponse.personen.find(
          (p) => p.burgerservicenummer === BSN
        );
        remoteApi.post(/\/personen/).reply(200, { personen: [testPersoon] });
        remoteApi
          .post(/\/verblijfplaatshistorie/)
          .reply(200, verblijfplaatsenResponse);

        const response = await fetchBrpByBsnTransformed('test-session-id', [
          BSN,
        ]);

        expect(response).toMatchSnapshot();
        expect(response.status).toBe('OK');
        expect(response.content?.persoon.bsn).toBe(BSN);
      });

      test('Formatting for test BSN 2, with verblijfplaatshistorie returning an error', async () => {
        vi.unmock('../../helpers/source-api-request');

        (fetchAuthTokenHeader as Mock).mockResolvedValue({
          content: { Authorization: 'Bearer test-token' },
          status: 'OK',
        });

        const BSN = '999990810';
        const testPersoon = testPersonenResponse.personen.find(
          (p) => p.burgerservicenummer === BSN
        );
        remoteApi.post(/\/personen/).reply(200, { personen: [testPersoon] });
        remoteApi
          .post(/\/verblijfplaatshistorie/)
          .reply(500, 'Internal Server Error');

        const response = await fetchBrpByBsnTransformed('test-session-id', [
          BSN,
        ]);

        expect(response).toMatchSnapshot();
        expect(response.status).toBe('OK');
        expect(response.content?.persoon.bsn).toBe(BSN);
      });
    });
  });
});
