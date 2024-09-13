import { ZorgnedAanvraagTransformed } from '../../zorgned/zorgned-types';
import { AV_PCVZIL, AV_UPCC, AV_UPCZIL, forTesting } from './pcvergoeding';

describe('pcvergoeding', () => {
  describe('isVerzilveringVanRegeling', () => {
    const testData = [
      {
        productIdentificatie: AV_UPCC,
        betrokkenen: ['A'],
      },
      {
        productIdentificatie: AV_UPCZIL,
        betrokkenen: ['A'],
      },
      {
        productIdentificatie: AV_UPCZIL,
        betrokkenen: ['B'],
      },
    ] as unknown as ZorgnedAanvraagTransformed[];

    test('isVerzilveringVanRegeling', () => {
      expect(
        forTesting.isVerzilveringVanRegeling(testData[0], testData[1])
      ).toBe(true);

      expect(
        forTesting.isVerzilveringVanRegeling(testData[0], testData[2])
      ).toBe(false);
    });
  });

  describe('isRegelingVanVerzilvering', () => {
    const testData = [
      {
        productIdentificatie: AV_UPCC,
        betrokkenen: ['A'],
      },
      {
        productIdentificatie: AV_UPCC,
        betrokkenen: ['A'],
        resultaat: 'afgewezen',
      },
      {
        productIdentificatie: AV_UPCZIL,
        betrokkenen: ['A'],
      },
      {
        productIdentificatie: AV_UPCZIL,
        betrokkenen: ['B'],
      },
    ] as unknown as ZorgnedAanvraagTransformed[];

    test('isRegelingVanVerzilvering', () => {
      expect(
        forTesting.isRegelingVanVerzilvering(testData[2], testData[0])
      ).toBe(true);

      expect(
        forTesting.isRegelingVanVerzilvering(testData[2], testData[1])
      ).toBe(false);

      expect(
        forTesting.isRegelingVanVerzilvering(testData[3], testData[0])
      ).toBe(false);
    });
  });

  test('getUpcPcvDecisionDate', () => {
    const UNUSED_DATE = new Date();
    const testData = [
      {
        productIdentificatie: AV_UPCC,
        betrokkenen: ['A'],
        datumBesluit: '2024-05-18',
      },
      {
        productIdentificatie: AV_UPCZIL,
        betrokkenen: ['A'],
        datumBesluit: '2028-05-18',
      },
    ] as unknown as ZorgnedAanvraagTransformed[];

    expect(
      forTesting.getUpcPcvDecisionDate(testData[1], UNUSED_DATE, testData)
    ).toBe('2024-05-18');
  });

  test('isWorkshopNietGevolgd', () => {
    const regeling1 = {
      productIdentificatie: 'AV-UPCZIL',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isWorkshopNietGevolgd(regeling1)).toBe(false);

    const regeling2 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-07-29',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isWorkshopNietGevolgd(regeling2)).toBe(false);

    const regeling3 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isWorkshopNietGevolgd(regeling3)).toBe(false);

    const regeling4 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29T23:45:00',
      datumIngangGeldigheid: '2024-08-29T11:32:00',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isWorkshopNietGevolgd(regeling4)).toBe(true);
  });
});
