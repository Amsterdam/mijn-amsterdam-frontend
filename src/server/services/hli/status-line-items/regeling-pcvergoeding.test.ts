import {
  AV_PCVC,
  AV_PCVZIL,
  AV_UPCC,
  AV_UPCZIL,
  forTesting,
} from './regeling-pcvergoeding';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../../zorgned/zorgned-types';

describe('pcvergoeding', () => {
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
    ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

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
    ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    expect(
      forTesting.getUpcPcvDecisionDate(testData[1], UNUSED_DATE, testData)
    ).toBe('2024-05-18');
  });

  test('isWorkshopNietGevolgd', () => {
    const regeling1 = {
      productIdentificatie: 'AV-UPCZIL',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    expect(forTesting.isWorkshopNietGevolgd(regeling1)).toBe(false);

    const regeling2 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-07-29',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    expect(forTesting.isWorkshopNietGevolgd(regeling2)).toBe(false);

    const regeling3 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    expect(forTesting.isWorkshopNietGevolgd(regeling3)).toBe(false);

    const regeling4 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29T23:45:00',
      datumIngangGeldigheid: '2024-08-29T11:32:00',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    expect(forTesting.isWorkshopNietGevolgd(regeling4)).toBe(true);
  });

  describe('getBetrokkenKinderen', () => {
    test('Name and DateOfBirth known', () => {
      expect(
        forTesting.getBetrokkenKinderen({
          betrokkenPersonen: [
            {
              bsn: '',
              dateOfBirth: '',
              name: 'Foo',
              dateOfBirthFormatted: '12 juli 1981',
            },
          ],
        } as ZorgnedAanvraagWithRelatedPersonsTransformed)
      ).toMatchInlineSnapshot(`"Foo (geboren op 12 juli 1981)"`);
    });

    test('Name and DateOfBirth known multiple kids', () => {
      expect(
        forTesting.getBetrokkenKinderen({
          betrokkenPersonen: [
            {
              bsn: '',
              dateOfBirth: '',
              name: 'Foo',
              dateOfBirthFormatted: '12 juli 1981',
            },
            {
              bsn: '',
              dateOfBirth: '',
              name: 'Bar',
              dateOfBirthFormatted: '01 december 1983',
            },
          ],
        } as ZorgnedAanvraagWithRelatedPersonsTransformed)
      ).toMatchInlineSnapshot(
        `"Foo (geboren op 12 juli 1981) en Bar (geboren op 01 december 1983)"`
      );
    });

    test('Name known', () => {
      expect(
        forTesting.getBetrokkenKinderen({
          betrokkenPersonen: [
            {
              bsn: '',
              dateOfBirth: '',
              name: 'Foo',
              dateOfBirthFormatted: '',
            },
          ],
        } as ZorgnedAanvraagWithRelatedPersonsTransformed)
      ).toMatchInlineSnapshot(`"Foo"`);
    });

    test('Name known multiple', () => {
      expect(
        forTesting.getBetrokkenKinderen({
          betrokkenPersonen: [
            {
              bsn: '',
              dateOfBirth: '',
              name: 'Foo',
              dateOfBirthFormatted: '',
            },
            {
              bsn: '',
              dateOfBirth: '',
              name: 'Bar',
              dateOfBirthFormatted: '',
            },
          ],
        } as ZorgnedAanvraagWithRelatedPersonsTransformed)
      ).toMatchInlineSnapshot(`"Foo en Bar"`);
    });

    test('Name unknown', () => {
      expect(
        forTesting.getBetrokkenKinderen({
          betrokkenPersonen: [
            {
              bsn: '',
              dateOfBirth: '',
              name: '',
              dateOfBirthFormatted: '',
            },
          ],
        } as ZorgnedAanvraagWithRelatedPersonsTransformed)
      ).toBe(null);
    });

    test('Name known multiple, 1 dateOfBirth', () => {
      expect(
        forTesting.getBetrokkenKinderen({
          betrokkenPersonen: [
            {
              bsn: '',
              dateOfBirth: '',
              name: 'Foo',
              dateOfBirthFormatted: '1 juli 2017',
            },
            {
              bsn: '',
              dateOfBirth: '',
              name: 'Bar',
              dateOfBirthFormatted: '',
            },
          ],
        } as ZorgnedAanvraagWithRelatedPersonsTransformed)
      ).toMatchInlineSnapshot(`"Foo (geboren op 1 juli 2017) en Bar"`);
    });
  });

  describe('filterCombineUpcPcvData', () => {
    test('combines documents and updates fields correctly', () => {
      const testData = [
        {
          id: '2',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumBesluit: '2024-06-18',
          resultaat: 'toegewezen',
          documenten: ['doc2'],
        },
        {
          id: '1',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['A'],
          datumBesluit: '2024-05-18',
          isActueel: true,
          documenten: ['doc1'],
        },
      ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result = forTesting.filterCombineUpcPcvData(testData);

      expect(result).toEqual([
        {
          id: '2',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumBesluit: '2024-06-18',
          resultaat: 'toegewezen',
          isActueel: true,
          datumEindeGeldigheid: null,
          documenten: ['doc2', 'doc1'],
        },
      ]);
    });

    test('excludes baseRegelingen that have verzilvering', () => {
      const testData = [
        {
          id: '3',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['B'],
          datumBesluit: '2024-07-18',
          isActueel: true,
          documenten: ['doc3'],
        },
        {
          id: '2',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumBesluit: '2024-06-18',
          resultaat: 'toegewezen',
          documenten: ['doc2'],
        },
        {
          id: '1',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['A'],
          datumBesluit: '2024-05-18',
          isActueel: true,
          documenten: ['doc1'],
        },
      ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result = forTesting.filterCombineUpcPcvData(testData);

      expect(result).toEqual([
        {
          id: '3',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['B'],
          datumBesluit: '2024-07-18',
          isActueel: true,
          documenten: ['doc3'],
        },
        {
          id: '2',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumBesluit: '2024-06-18',
          resultaat: 'toegewezen',
          isActueel: true,
          datumEindeGeldigheid: null,
          documenten: ['doc2', 'doc1'],
        },
      ]);
    });

    test('handles no matching baseRegeling', () => {
      const testData = [
        {
          id: '1',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumBesluit: '2024-05-18',
          resultaat: 'toegewezen',
          documenten: ['doc1'],
        },
      ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result = forTesting.filterCombineUpcPcvData(testData);

      expect(result).toEqual([]);
    });
  });
});
