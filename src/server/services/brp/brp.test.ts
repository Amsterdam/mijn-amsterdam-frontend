import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';

import {
  forTesting,
  fetchBrpByBsn,
  fetchBrpByBsnTransformed,
  fetchBrpVerblijfplaatsHistoryByBsn,
  fetchAantalBewoners,
} from './brp';
import { AANTAL_BEWONERS_NOT_SET } from './brp-config';
import {
  DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_FROM,
  DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_TO,
} from './brp-service-config';
import type { PersonenResponseSource } from './brp-types';
import testPersonenResponse from '../../../../mocks/fixtures/brp/test-personen.json';
import verblijfplaatsenResponse from '../../../../mocks/fixtures/brp/verblijfplaatshistorie.json';
import { remoteApi } from '../../../testing/utils';
import * as sourceApi from '../../helpers/source-api-request';
import { fetchAuthTokenHeader } from '../iam-oauth/oauth-token';

const {
  fetchBenkBrpTokenHeader,
  getDatum,
  transformBenkBrpResponse,
  translateBSN,
} = forTesting;

vi.mock('../../helpers/encrypt-decrypt', () => {
  return {
    encryptSessionIdWithRouteIdParam: () => {
      return ['test-encrypted-id'];
    },
  };
});

vi.mock('../iam-oauth/oauth-token', () => ({
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
        'IAM_MS_OAUTH',
        {
          sourceApiName: 'BENK_BRP',
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

  describe('fetchAantalBewoners', () => {
    beforeEach(() => {
      (fetchAuthTokenHeader as Mock).mockResolvedValueOnce({
        status: 'OK',
        content: 'xxx',
      });
    });
    it('should return AANTAL_BEWONERS_NOT_SET when response is null', async () => {
      remoteApi.post(/\/personen/).reply(200, null);

      const response = await fetchAantalBewoners(
        'test-session-id',
        'test-bag-id'
      );
      expect(response.content).toBe(AANTAL_BEWONERS_NOT_SET);
    });

    it('should return AANTAL_BEWONERS_NOT_SET when no personen in response', async () => {
      remoteApi.post(/\/personen/).reply(200, {});

      const response = await fetchAantalBewoners(
        'test-session-id',
        'test-bag-id'
      );
      expect(response.content).toBe(AANTAL_BEWONERS_NOT_SET);
    });

    it('should return correct aantal bewoners from response', async () => {
      const responseData = {
        personen: [
          { naam: { volledigeNaam: 'John Doe' } },
          { naam: { volledigeNaam: 'Jane Smith' } },
        ],
      };
      remoteApi.post(/\/personen/).reply(200, responseData);

      const response = await fetchAantalBewoners(
        'test-session-id',
        'test-bag-id'
      );
      expect(response.content).toBe(2);
    });

    it('should filter out personen with opschortingBijhouding datum in the past', async () => {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 1);
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 1);

      const responseData = {
        personen: [
          {
            naam: { volledigeNaam: 'John Doe' },
            opschortingBijhouding: {
              datum: {
                type: 'Datum',
                datum: pastDate.toISOString().split('T')[0],
                langFormaat: '',
              },
              reden: { code: 'O', omschrijving: 'overlijden' },
            },
          },
          {
            naam: { volledigeNaam: 'Jane Smith' },
            opschortingBijhouding: {
              datum: {
                type: 'Datum',
                datum: futureDate.toISOString().split('T')[0],
                langFormaat: '',
              },
              reden: { code: 'O', omschrijving: 'andere-reden' },
            },
          },
          {
            naam: { volledigeNaam: 'Alice Johnson' },
          },
        ],
      };
      remoteApi.post(/\/personen/).reply(200, responseData);

      const response = await fetchAantalBewoners(
        'test-session-id',
        'test-bag-id'
      );
      expect(response.content).toBe(2); // Jane Smith and Alice Johnson
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

      const result = transformBenkBrpResponse(
        'xx-aa',
        responseData.personen[0] as PersonenResponseSource['personen'][0]
      );
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

        const response = await fetchBrpByBsnTransformed('test-session-id', BSN);

        expect(response).toMatchSnapshot();
        expect(response.status).toBe('OK');
        expect(response.content?.persoon.bsn).toBe(BSN);
      });

      test('Formatting for test BSN 2, with verblijfplaatshistorie returning an error', async () => {
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

        const response = await fetchBrpByBsnTransformed('test-session-id', BSN);

        expect(response).toMatchSnapshot();
        expect(response.status).toBe('OK');
        expect(response.content?.persoon.bsn).toBe(BSN);
      });
    });
  });

  describe('fetchBrpVerblijfplaatsHistoryByBsn', () => {
    const BSN = '999990810';
    const SID = 'xx-yy-zz';
    const requestSpy = vi.spyOn(sourceApi, 'requestData');

    beforeEach(() => {
      requestSpy.mockClear();
    });

    test('Uses passed dateFrom and dateTo', async () => {
      (fetchAuthTokenHeader as Mock).mockResolvedValue({
        content: { Authorization: 'Bearer test-token' },
        status: 'OK',
      });
      remoteApi.post(/benk_brp/).reply(200);

      await fetchBrpVerblijfplaatsHistoryByBsn(
        SID,
        BSN,
        '2020-01-01',
        '2021-01-01'
      );
      expect(requestSpy.mock.calls[0][0].data).toStrictEqual({
        burgerservicenummer: BSN,
        datumTot: '2021-01-01',
        datumVan: '2020-01-01',
        type: 'RaadpleegMetPeriode',
      });
    });

    test('Subtracts 1 year from dateFrom if dateFrom and dateTo are the same', async () => {
      (fetchAuthTokenHeader as Mock).mockResolvedValue({
        content: { Authorization: 'Bearer test-token' },
        status: 'OK',
      });
      remoteApi.post(/benk_brp/).reply(200);

      await fetchBrpVerblijfplaatsHistoryByBsn(
        SID,
        BSN,
        '2021-01-01',
        '2021-01-01'
      );
      expect(requestSpy.mock.calls[0][0].data).toStrictEqual({
        burgerservicenummer: '999990810',
        datumTot: '2021-01-01',
        datumVan: '2020-01-01',
        type: 'RaadpleegMetPeriode',
      });
    });

    test('Uses default dateFrom and dateTo if omitted', async () => {
      (fetchAuthTokenHeader as Mock).mockResolvedValue({
        content: { Authorization: 'Bearer test-token' },
        status: 'OK',
      });
      remoteApi.post(/benk_brp/).reply(200);

      await fetchBrpVerblijfplaatsHistoryByBsn(SID, BSN);
      expect(requestSpy.mock.calls[0][0].data).toStrictEqual({
        burgerservicenummer: '999990810',
        datumTot: DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_TO,
        datumVan: DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_FROM,
        type: 'RaadpleegMetPeriode',
      });
    });
  });
});
