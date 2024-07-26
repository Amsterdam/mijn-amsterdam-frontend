import { ZorgnedAanvraagTransformed } from '../../zorgned/zorgned-config-and-types';
import {
  AV_PCVZIL,
  AV_UPCC,
  AV_UPCZIL,
  shouldIncludePcvcUpcc,
  forTesting,
} from './pcvergoeding';

describe('pcvergoeding', () => {
  describe('shouldIncludePcvcUpcc', () => {
    test('Does not exclude on base of betrokkenen', () => {
      const testData = [
        {
          productIdentificatie: AV_UPCC,
          betrokkenen: ['A'],
        },
        {
          productIdentificatie: AV_UPCZIL,
          betrokkenen: ['B'],
        },
      ] as unknown as ZorgnedAanvraagTransformed[];

      expect(shouldIncludePcvcUpcc(testData[0], testData)).toBe(true);
    });

    test('Excludes on base of betrokkenen', () => {
      const testData = [
        {
          productIdentificatie: AV_UPCC,
          betrokkenen: ['A'],
        },
        {
          productIdentificatie: AV_UPCZIL,
          betrokkenen: ['A'],
        },
      ] as unknown as ZorgnedAanvraagTransformed[];

      expect(shouldIncludePcvcUpcc(testData[0], testData)).toBe(false);
    });

    test('Does not exclude on base of other AV code', () => {
      const testData = [
        {
          productIdentificatie: AV_UPCC,
          betrokkenen: ['A'],
        },
        {
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
        },
      ] as unknown as ZorgnedAanvraagTransformed[];

      expect(shouldIncludePcvcUpcc(testData[0], testData)).toBe(true);
    });
  });

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
});
