import { describe, it, expect, vi } from 'vitest';

import { fetchKVK, forTesting } from './hr-kvk';
import type {
  MACResponseSource,
  VestigingenResponseSource,
} from './hr-kvk.types';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { apiErrorResult } from '../../../universal/helpers/api';

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

  describe('fetchKVK', () => {
    it('returns an error when both MAC and vestigingen requests fail', async () => {
      remoteApi
        .post(/datapunt\/iam/)
        .times(2)
        .reply(200);
      remoteApi.get(/\/vestigingen/).reply(500);
      remoteApi.get(/\/maatschappelijkeactiviteiten/).reply(500);

      const result = await fetchKVK(getAuthProfileAndToken('commercial'));

      expect(result).toEqual(apiErrorResult('Failed to fetch KVK data', null));
    });

    it('returns a successful response when only maatschappelijke activiteiten succeeds', async () => {
      remoteApi
        .post(/datapunt\/iam/)
        .times(2)
        .reply(200);
      remoteApi.get(/\/vestigingen/).reply(500);
      remoteApi.get(/\/maatschappelijkeactiviteiten/).reply(200, {
        _embedded: {
          maatschappelijkeactiviteiten: [
            { naam: 'Test onderneming', activiteiten: [], handelsnamen: [] },
          ],
        },
      });

      const result = await fetchKVK(getAuthProfileAndToken('commercial'));

      expect(result.status).toBe('OK');
      expect(result.content).toMatchObject({
        eigenaar: null,
        mokum: false,
        onderneming: {
          handelsnaam: 'Test onderneming',
        },
        vestigingen: [],
      });
    });

    it('returns a successful response when only vestigingen succeeds', async () => {
      remoteApi
        .post(/datapunt\/iam/)
        .times(2)
        .reply(200);
      remoteApi.get(/\/vestigingen/).reply(200, {
        _embedded: {
          vestigingen: [
            { naam: 'Test Vestiging', activiteiten: [], handelsnamen: [] },
          ],
        },
      });
      remoteApi.get(/\/maatschappelijkeactiviteiten/).reply(500);

      const result = await fetchKVK(getAuthProfileAndToken('commercial'));

      expect(result.status).toBe('OK');
      expect(result.content).toMatchObject({
        eigenaar: null,
        mokum: false,
        onderneming: null,
        vestigingen: [
          {
            naam: 'Test Vestiging',
          },
        ],
      });
    });

    it('returns an error when both requests fail', async () => {
      remoteApi
        .post(/datapunt\/iam/)
        .times(2)
        .reply(200);
      remoteApi.get(/\/vestigingen/).reply(500);
      remoteApi.get(/\/maatschappelijkeactiviteiten/).reply(500);

      const result = await fetchKVK(getAuthProfileAndToken('commercial'));

      expect(result).toEqual(apiErrorResult('Failed to fetch KVK data', null));
    });
  });

  describe('transformVestigingen', () => {
    it('handles missing _embedded field gracefully', () => {
      const result = forTesting.transformVestigingen(null);
      expect(result).toEqual([]);
    });

    it('transforms vestigingen correctly when data is present', () => {
      const mockResponse: VestigingenResponseSource = {
        _embedded: {
          vestigingen: [
            {
              naam: 'Vestiging 1',
              hoofdvestiging: 'Ja',
              activiteiten: [
                { isHoofdactiviteit: true, omschrijving: 'Activiteit 1' },
              ],
              handelsnamen: [{ handelsnaam: 'Handelsnaam 1', volgorde: '1' }],
              emailAdressen: [{ emailAdres: 'email@example.com' }],
              postHeeftBagNummeraanduidingId: null,
              postHeeftBagLigplaatsId: null,
              postHeeftBagStandplaatsId: null,
              bezoekHeeftBagNummeraanduidingId: null,
              bezoekHeeftBagLigplaatsId: null,
              bezoekHeeftBagStandplaatsId: null,
              vestigingsnummer: '123123',
              datumAanvangDatum: null,
              datumAanvangJaar: 1937,
              datumAanvangMaand: 0,
              datumAanvangDag: 0,
              datumEindeDatum: null,
              datumEindeJaar: null,
              datumEindeMaand: null,
              datumEindeDag: null,
              datumVoortzettingDatum: null,
              datumVoortzettingJaar: null,
              datumVoortzettingMaand: null,
              datumVoortzettingDag: null,
              isCommercieleVestiging: 'Ja',
              eersteHandelsnaam: 'Handelsnaam 1',
              bezoekLocatieVolledigAdres: 'Demo straat 1, 1011 AA Amsterdam',
              postLocatieVolledigAdres: 'Postbus 1, 1000 AA Amsterdam',
              communicatie: [
                { nummer: '0201234567', soort: 'telefoonnummer' },
                { nummer: '0207654321', soort: 'faxnummer' },
              ],
              domeinnamen: [{ domeinnaam: 'www.example.com' }],
            },
          ],
        },
      };

      const result = forTesting.transformVestigingen(mockResponse);

      expect(result).toStrictEqual([
        {
          activiteiten: ['Activiteit 1'],
          bezoekHeeftBagLigplaatsId: null,
          bezoekHeeftBagNummeraanduidingId: null,
          bezoekHeeftBagStandplaatsId: null,
          bezoekadres: 'Demo straat 1, 1011 AA Amsterdam',
          datumAanvang: null,
          datumAanvangFormatted: 'Anno 1937',
          datumEinde: null,
          datumEindeFormatted: null,
          emailadres: ['email@example.com'],
          faxnummer: ['0207654321'],
          handelsnamen: ['Handelsnaam 1'],
          isHoofdvestiging: true,
          naam: 'Vestiging 1',
          postHeeftBagLigplaatsId: null,
          postHeeftBagNummeraanduidingId: null,
          postHeeftBagStandplaatsId: null,
          postadres: 'Postbus 1, 1000 AA Amsterdam',
          telefoonnummer: ['0201234567'],
          vestigingsNummer: '123123',
          websites: ['www.example.com'],
        },
      ]);
    });
  });

  describe('transformMAC', () => {
    it('transforms MAC response data correctly', () => {
      const mockMACResponse: MACResponseSource = {
        _embedded: {
          maatschappelijkeactiviteiten: [
            {
              naam: 'Test Company',
              handelsnamen: [
                { handelsnaam: 'Test Handelsnaam', volgorde: '2' },
                { handelsnaam: 'Een andere Handelsnaam', volgorde: '1' },
              ],
              activiteiten: [
                { omschrijving: 'Hoofdactiviteit', isHoofdactiviteit: true },
                {
                  omschrijving: 'Overige activiteit',
                  isHoofdactiviteit: false,
                },
              ],
              kvknummer: '12345678',
              datumAanvangMaatschappelijkeActiviteit: {
                datumAanvangMaatschappelijkeActiviteitDatum: '2022-03-27',
                datumAanvangMaatschappelijkeActiviteitJaar: '2022',
                datumAanvangMaatschappelijkeActiviteitMaand: '03',
                datumAanvangMaatschappelijkeActiviteitDag: '27',
              },
              datumEindeMaatschappelijkeActiviteit: {
                datumEindeMaatschappelijkeActiviteitDatum: '2025-07-03',
                datumEindeMaatschappelijkeActiviteitJaar: '2025',
                datumEindeMaatschappelijkeActiviteitMaand: '07',
                datumEindeMaatschappelijkeActiviteitDag: '03',
              },
            },
          ],
          heeftAlsEigenaarHrNnp: [
            {
              naam: 'Test Owner',
              rechtsvorm: 'BV',
              rsin: '987654321',
              typePersoon: 'Rechtspersoon',
              uitgebreideRechtsvorm: '',
              volledigeNaam: '',
            },
          ],
          heeftAlsEigenaarHrNps: [],
        },
      };

      const result = forTesting.transformMAC(mockMACResponse);
      expect(result).toStrictEqual({
        eigenaar: {
          naam: 'Test Owner',
          rsin: '987654321',
          typePersoon: 'Rechtspersoon',
        },
        onderneming: {
          datumAanvang: '2022-03-27',
          datumAanvangFormatted: '27 maart 2022',
          datumEinde: '2025-07-03',
          datumEindeFormatted: '03 juli 2025',
          handelsnaam: 'Test Company',
          handelsnamen: ['Een andere Handelsnaam', 'Test Handelsnaam'],
          hoofdactiviteit: 'Overige activiteit',
          kvknummer: '12345678',
          overigeActiviteiten: ['Hoofdactiviteit'],
          rechtsvorm: 'BV',
        },
      });
    });
  });
});
