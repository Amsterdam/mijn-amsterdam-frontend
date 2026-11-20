import { forTesting } from './energie.ts';
import type { EnergieLabelSourceData } from './energie.types.ts';

describe('transformEnergieLabelDataResponse', () => {
  it('transforms the first energy label fraction', () => {
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
    ).toStrictEqual({
      energieklasse: 'A',
      geldigTotDatum: '01 januari 2030',
    });
  });
});
