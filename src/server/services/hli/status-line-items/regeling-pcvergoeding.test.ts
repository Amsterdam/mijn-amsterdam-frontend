import Mockdate from 'mockdate';

import {
  AV_PCVC,
  AV_PCVTG,
  AV_PCVZIL,
  AV_UPCC,
  AV_UPCTG,
  AV_UPCZIL,
  forTesting,
} from './regeling-pcvergoeding';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../../zorgned/zorgned-types';

const mocks = vi.hoisted(() => {
  return {
    hli2026PCVergoedingV3Enabled: true,
  };
});

vi.mock(
  '../../../../client/pages/Thema/HLI/HLI-thema-config',
  async (importActual) => {
    const actual =
      await importActual<
        typeof import('../../../../client/pages/Thema/HLI/HLI-thema-config')
      >();
    return {
      ...actual,
      featureToggle: {
        ...actual.featureToggle,
        get hli2026PCVergoedingV3Enabled() {
          return mocks.hli2026PCVergoedingV3Enabled;
        },
      },
    };
  }
);

describe('pcvergoeding', () => {
  describe('isRegelingVanVerzilvering', () => {
    describe('Historic', () => {
      test('AV_UPCZIL', () => {
        const testData = [
          {
            productIdentificatie: AV_UPCC,
            betrokkenen: ['A'],
            datumAanvraag: '2024-01-01',
          },
          {
            productIdentificatie: AV_UPCC,
            betrokkenen: ['A'],
            resultaat: 'afgewezen',
            datumAanvraag: '2024-01-01',
          },
          {
            productIdentificatie: AV_UPCZIL,
            betrokkenen: ['A'],
            datumAanvraag: '2024-01-01',
          },
          {
            productIdentificatie: AV_UPCZIL,
            betrokkenen: ['B'],
            datumAanvraag: '2024-01-01',
          },
        ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

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
      test('AV_PCVZIL', () => {
        const testData = [
          {
            productIdentificatie: AV_PCVC,
            betrokkenen: ['A'],
            datumAanvraag: '2024-01-01',
          },
          {
            productIdentificatie: AV_PCVC,
            betrokkenen: ['A'],
            resultaat: 'afgewezen',
            datumAanvraag: '2024-01-01',
          },
          {
            productIdentificatie: AV_PCVZIL,
            betrokkenen: ['A'],
            datumAanvraag: '2024-01-01',
          },
          {
            productIdentificatie: AV_PCVZIL,
            betrokkenen: ['B'],
            datumAanvraag: '2024-01-01',
          },
        ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

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
    describe('Actual', () => {
      test('AV_UPCTG', () => {
        const testData = [
          {
            productIdentificatie: AV_UPCC,
            betrokkenen: ['A'],
            datumAanvraag: '2025-01-01',
          },
          {
            productIdentificatie: AV_UPCC,
            betrokkenen: ['A'],
            resultaat: 'afgewezen',
            datumAanvraag: '2025-01-01',
          },
          {
            productIdentificatie: AV_UPCTG,
            betrokkenen: ['A'],
            datumAanvraag: '2025-01-01',
          },
          {
            productIdentificatie: AV_UPCTG,
            betrokkenen: ['B'],
            datumAanvraag: '2025-01-01',
          },
        ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];
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
      test('AV_PCVTG', () => {
        const testData = [
          {
            productIdentificatie: AV_PCVC,
            betrokkenen: ['A'],
            datumAanvraag: '2025-01-01',
          },
          {
            productIdentificatie: AV_PCVC,
            betrokkenen: ['A'],
            resultaat: 'afgewezen',
            datumAanvraag: '2025-01-01',
          },
          {
            productIdentificatie: AV_PCVTG,
            betrokkenen: ['A'],
            datumAanvraag: '2025-01-01',
          },
          {
            productIdentificatie: AV_PCVTG,
            betrokkenen: ['B'],
            datumAanvraag: '2025-01-01',
          },
        ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];
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
  });

  test('getUpcPcvDecisionDate', () => {
    const UNUSED_DATE = new Date();
    const testData = [
      {
        productIdentificatie: AV_UPCC,
        betrokkenen: ['A'],
        datumBesluit: '2024-05-18',
        datumAanvraag: '2024-01-01',
      },
      {
        productIdentificatie: AV_UPCZIL,
        betrokkenen: ['A'],
        datumBesluit: '2028-05-18',
        datumAanvraag: '2024-01-01',
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
          titel: 'PC vergoeding verzilvering',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumAanvraag: '2024-01-01',
          datumBesluit: '2024-06-18',
          resultaat: 'toegewezen',
          documenten: ['doc2'],
        },
        {
          id: '1',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['A'],
          datumAanvraag: '2024-01-01',
          datumBesluit: '2024-05-18',
          isActueel: true,
          documenten: ['doc1'],
        },
      ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result = forTesting.filterCombineUpcPcvData(testData);

      expect(result).toEqual([
        {
          id: '2',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumAanvraag: '2024-01-01',
          datumBesluit: '2024-06-18',
          resultaat: 'toegewezen',
          isActueel: true,
          datumEindeGeldigheid: null,
          documenten: ['doc2', 'doc1'],
        },
      ]);
    });

    test('older aanvragen with zil codes do not conflict with new ones', () => {
      const testData = [
        {
          id: 'new-2',
          titel: 'PC vergoeding verzilvering',
          productIdentificatie: AV_PCVTG,
          betrokkenen: ['B'],
          datumBesluit: '2025-06-18',
          datumAanvraag: '2025-04-18',
          resultaat: 'toegewezen',
          documenten: ['new-doc-2'],
        },
        {
          id: 'historic-4',
          titel: 'PC vergoeding verzilvering',
          productIdentificatie: AV_UPCZIL,
          betrokkenen: ['C'],
          datumBesluit: '2024-06-18',
          datumAanvraag: '2024-04-18',
          resultaat: 'toegewezen',
          documenten: ['historic-doc-4'],
        },
        {
          id: 'historic-3',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_UPCC,
          betrokkenen: ['C'],
          datumBesluit: '2024-05-18',
          datumAanvraag: '2024-04-18',
          isActueel: true,
          documenten: ['historic-doc-3'],
        },
        {
          id: 'new-1',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['B'],
          datumBesluit: '2025-05-18',
          datumAanvraag: '2025-04-18',
          isActueel: true,
          documenten: ['new-doc-1'],
        },
        {
          id: 'historic-2',
          titel: 'PC vergoeding verzilvering',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumBesluit: '2024-06-18',
          datumAanvraag: '2024-04-18',
          resultaat: 'toegewezen',
          documenten: ['historic-doc-2'],
        },
        {
          id: 'historic-1',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['A'],
          datumBesluit: '2024-05-18',
          datumAanvraag: '2024-04-18',
          isActueel: true,
          documenten: ['historic-doc-1'],
        },
      ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result = forTesting.filterCombineUpcPcvData(testData);

      expect(result).toStrictEqual([
        {
          id: 'new-2',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVTG,
          betrokkenen: ['B'],
          datumBesluit: '2025-06-18',
          datumEindeGeldigheid: null,
          datumAanvraag: '2025-04-18',
          resultaat: 'toegewezen',
          isActueel: true,
          documenten: ['new-doc-2', 'new-doc-1'],
        },
        {
          id: 'historic-4',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_UPCZIL,
          betrokkenen: ['C'],
          datumBesluit: '2024-06-18',
          datumAanvraag: '2024-04-18',
          datumEindeGeldigheid: null,
          isActueel: true,
          resultaat: 'toegewezen',
          documenten: ['historic-doc-4', 'historic-doc-3'],
        },
        {
          id: 'historic-2',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumBesluit: '2024-06-18',
          datumAanvraag: '2024-04-18',
          resultaat: 'toegewezen',
          isActueel: true,
          datumEindeGeldigheid: null,
          documenten: ['historic-doc-2', 'historic-doc-1'],
        },
      ]);
    });

    test('excludes baseRegelingen that have verzilvering', () => {
      const testData = [
        {
          id: '3',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['B'],
          datumAanvraag: '2024-01-01',
          datumBesluit: '2024-07-18',
          isActueel: true,
          documenten: ['doc3'],
        },
        {
          id: '2',
          titel: 'PC vergoeding verzilvering',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumAanvraag: '2024-01-02',
          datumBesluit: '2024-06-18',
          resultaat: 'toegewezen',
          documenten: ['doc2'],
        },
        {
          id: '1',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['A'],
          datumAanvraag: '2024-01-03',
          datumBesluit: '2024-05-18',
          isActueel: true,
          documenten: ['doc1'],
        },
      ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result = forTesting.filterCombineUpcPcvData(testData);

      expect(result).toEqual([
        {
          id: '3',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVC,
          betrokkenen: ['B'],
          datumAanvraag: '2024-01-01',
          datumBesluit: '2024-07-18',
          isActueel: true,
          documenten: ['doc3'],
        },
        {
          id: '2',
          titel: 'PC vergoeding aanvraag',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumAanvraag: '2024-01-02',
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
          datumAanvraag: '2024-01-01',
          datumBesluit: '2024-05-18',
          resultaat: 'toegewezen',
          documenten: ['doc1'],
        },
      ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result = forTesting.filterCombineUpcPcvData(testData);

      expect(result).toEqual([]);
    });

    describe('Regeling V3 conditional', () => {
      const testData = [
        {
          id: '1',
          productIdentificatie: AV_PCVZIL,
          betrokkenen: ['A'],
          datumAanvraag: '2026-01-01',
          datumBesluit: '2026-02-18',
          resultaat: 'toegewezen',
          documenten: ['doc1'],
        },
      ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      test('Startdate is >= 01-01-2026', () => {
        Mockdate.set('2026-01-01');
        const result = forTesting.filterCombineUpcPcvData(testData);
        expect(result).toEqual(testData);
      });

      test('Startdate is < 01-01-2026', () => {
        Mockdate.set('2025-12-31');
        const result = forTesting.filterCombineUpcPcvData(testData);
        expect(result).toEqual([]);
      });

      test('Feature toggle is off -> Verzilvering is orphaned / No base regeling.', () => {
        mocks.hli2026PCVergoedingV3Enabled = false;
        Mockdate.set('2026-01-01');
        const result = forTesting.filterCombineUpcPcvData(testData);
        expect(result).toEqual([]);
      });

      Mockdate.reset();
    });

    test('Filters out redundant pcvergoeding aanvragen in the case a Workshop is not followed', () => {
      const testData = [
        {
          id: '1-1',
          productIdentificatie: AV_PCVC,
          resultaat: 'toegewezen',
          datumIngangGeldigheid: '2024-08-29',
          datumEindeGeldigheid: '2024-08-29',
          beschikkingNummer: 123,
        },
        {
          id: '1-2',
          productIdentificatie: AV_PCVC,
          resultaat: 'afgewezen',
          datumIngangGeldigheid: null,
          datumEindeGeldigheid: null,
          beschikkingNummer: 123,
        },
      ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result =
        forTesting.filterOutRedundantPcVergoedingsAanvraagRegelingAanvragenWhenWorkShopNietGevolgd(
          testData
        );

      expect(result).toEqual([testData[0]]);
    });

    test('Does not filter out aanvragen derived from the same beschikking with different product identificatie and at least 1 pcvergoeding aanvraag present', () => {
      const testData = [
        {
          id: '1-1',
          productIdentificatie: AV_PCVC,
          resultaat: 'toegewezen',
          datumIngangGeldigheid: '2024-08-29',
          datumEindeGeldigheid: '2024-08-29',
          beschikkingNummer: 123,
        },
        {
          id: '1-2',
          productIdentificatie: 'AV-OTHER',
          resultaat: 'toegewezen',
          datumIngangGeldigheid: null,
          datumEindeGeldigheid: null,
          beschikkingNummer: 123,
        },
        {
          id: '1-3',
          productIdentificatie: 'AV-YET-ANOTHER',
          resultaat: 'afgewezen',
          datumIngangGeldigheid: null,
          datumEindeGeldigheid: null,
          beschikkingNummer: 123,
        },
      ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

      const result =
        forTesting.filterOutRedundantPcVergoedingsAanvraagRegelingAanvragenWhenWorkShopNietGevolgd(
          testData
        );

      expect(result).toEqual(testData);
    });
  });
});
