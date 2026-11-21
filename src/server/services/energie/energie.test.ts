import * as request from '../../helpers/source-api-request.ts';
import type { Adres } from '../brp/brp-types.ts';
import { forTesting } from './energie.ts';
import type { EnergieLabelSourceData } from './energie.types.ts';

describe('fetchEnergieLabel', () => {
  const requestData = vi.spyOn(request, 'requestData');

  beforeEach(() => {
    vi.clearAllMocks();
    requestData.mockResolvedValue({ status: 'OK', content: [] });
  });

  test.each([
    [null, { postcode: '1011AB', huisnummer: '10' }],
    ['A', { postcode: '1011AB', huisnummer: '10', huisnummertoevoeging: 'A' }],
  ])(
    'sends huisnummertoevoeging only when it is not null',
    async (huisnummertoevoeging, expectedParams) => {
      const adres: Adres = {
        straatnaam: null,
        postcode: '1011AB',
        woonplaatsNaam: null,
        landnaam: null,
        huisnummer: '10',
        huisnummertoevoeging,
        huisletter: null,
        begindatumVerblijf: null,
        isBewoner: true,
        isBriefadres: false,
      };

      await forTesting.fetchEnergieLabel(adres);

      expect(requestData).toHaveBeenCalledWith(
        expect.objectContaining({ params: expectedParams })
      );
    }
  );
});

describe('transformEnergieLabelDataResponse', () => {
  it('transforms the first energy label fraction correctly', () => {
    const sourceData: EnergieLabelSourceData = {
      _embedded: {
        energielabel: [
          {
            energieklasse: 'A',
            metingGeldigTot: '2030-01-01',
          },
          {
            energieklasse: 'B',
            metingGeldigTot: '2031-01-01',
          },
        ],
      },
    };

    expect(
      forTesting.transformEnergieLabelDataResponse(sourceData)
    ).toStrictEqual([
      {
        energieklasse: 'A',
        geldigTotDatum: '01 januari 2030',
      },
    ]);
  });
});
