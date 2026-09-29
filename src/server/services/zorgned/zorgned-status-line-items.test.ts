import { forTesting, getStatusLineItems } from './zorgned-status-line-items.ts';
import type {
  LeveringsVormTransformed,
  ProductSoortCode,
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemsConfig,
  ZorgnedStatusLineItemTransformerConfig,
} from './zorgned-types.ts';
import { type BeschikkingsResultaat } from './zorgned-types.ts';
import { logger } from '../../logging.ts';

function getTransformerConfig() {
  const transformerConfig: ZorgnedStatusLineItemTransformerConfig = {
    status: 'Status 1',
    datePublished: vi.fn(),
    isChecked: vi.fn(),
    isActive: vi.fn(),
    description: vi.fn(),
  };

  return transformerConfig;
}

const transformerConfig = getTransformerConfig();
const transformerConfig2 = getTransformerConfig();
const transformerConfig4 = getTransformerConfig();

const transformerConfigs = [transformerConfig, transformerConfig2];

function createAanvraag(
  overrides: Partial<ZorgnedAanvraagTransformed> = {}
): ZorgnedAanvraagTransformed {
  return {
    betrokkenen: [],
    datumAanvraag: '2024-01-01',
    datumBeginLevering: null,
    datumBesluit: '2024-06-01',
    datumEindeGeldigheid: null,
    datumEindeLevering: null,
    datumIngangGeldigheid: null,
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    procesAanvraagOmschrijving: null,
    documenten: [],
    id: 'aanvraag-1',
    prettyID: 'aanvraag-1',
    procesIdentificatie: 'proces-1',
    procesMeldingIdentificatie: null,
    isActueel: false,
    leverancier: null,
    leverancierIdentificatie: null,
    leveringsVorm: 'ZIN',
    productsoortCode: null,
    beschiktProductIdentificatie: null,
    beschikkingNummer: null,
    regelingIdentificatie: null,
    resultaat: null,
    titel: 'Test aanvraag',
    ...overrides,
  };
}

const lineItemsConfig1: ZorgnedStatusLineItemsConfig = {
  leveringsVorm: 'ZIN',
  productsoortCodes: ['BAR', 'FOO'],
  productgroep: 'Test line items 1',
  statusLineItems: {
    transformers: [transformerConfig, transformerConfig2],
  },
};

const lineItemsConfig2: ZorgnedStatusLineItemsConfig = {
  productIdentificatie: ['BAR'],
  productgroep: 'Test line items 2',
  statusLineItems: {
    transformers: [transformerConfig2],
  },
  filter(aanvraag) {
    return aanvraag.betrokkenen?.includes('B');
  },
};

const lineItemsConfig3: ZorgnedStatusLineItemsConfig = {
  productIdentificatie: ['BAR'],
  filter(aanvraag) {
    return aanvraag.betrokkenen?.includes('A');
  },
  productgroep: 'Test line items 3',
  statusLineItems: {
    transformers: [transformerConfig],
  },
};

const lineItemsConfig4: ZorgnedStatusLineItemsConfig = {
  productsoortCodes: ['NUB'],
  productgroep: 'Test line items 4',
  statusLineItems: {
    transformers: [transformerConfig4],
  },
};

const lineItemConfigs = [
  lineItemsConfig1,
  lineItemsConfig2,
  lineItemsConfig3,
  lineItemsConfig4,
];

describe('zorgned-status-line-items', () => {
  const logSpy = vi.spyOn(logger, 'error');

  describe('getStatusLineItemTransformers', () => {
    test('Get transformers', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        createAanvraag({
          leveringsVorm: 'ZIN',
          productsoortCode: 'BAR',
        }),
        []
      );

      expect(lineItemTransformers).toStrictEqual(transformerConfigs);
    });

    test('Get transformers: ProductIdentificatie', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        createAanvraag({
          leveringsVorm: 'PGB',
          productsoortCode: 'ALB',
          productIdentificatie: 'BAR',
          betrokkenen: ['B'],
        }),
        []
      );

      expect(lineItemTransformers).toStrictEqual([transformerConfig2]);
    });

    test('Get transformers: filter match based on Betrokkenen', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        createAanvraag({
          betrokkenen: ['B'],
          leveringsVorm: '',
          productsoortCode: '',
          productIdentificatie: 'BAR',
        }),
        []
      );

      expect(lineItemTransformers).toStrictEqual([transformerConfig2]);

      const lineItemTransformers2 = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        createAanvraag({
          betrokkenen: ['A'],
          leveringsVorm: '',
          productsoortCode: '',
          productIdentificatie: 'BAR',
        }),
        []
      );

      expect(lineItemTransformers2).toStrictEqual([transformerConfig]);
    });

    test('Get transformers: No match for leveringsvorm and productsoortCode', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        createAanvraag({
          leveringsVorm: 'PGB',
          productsoortCode: 'ALB',
        }),
        []
      );

      expect(lineItemTransformers).toBe(null);
    });

    test('Get transformers: Only match productSoortCode', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        createAanvraag({
          leveringsVorm: '',
          productsoortCode: 'NUB',
        }),
        []
      );

      expect(lineItemTransformers).toStrictEqual([transformerConfig4]);
    });

    test('Get transformers: No match for productSoortCode or productIdentificatie', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        createAanvraag({
          leveringsVorm: 'ZIN',
          productsoortCode: '',
          productIdentificatie: 'FOO',
        }),
        []
      );

      expect(lineItemTransformers).toBe(null);
    });
  });

  describe('getStatusLineItems', () => {
    function getAanvraagTransformed(
      leveringsVorm: LeveringsVormTransformed = 'ZIN',
      productsoortCode: ProductSoortCode | null = 'BAR',
      productIdentificatie: string = 'WORLD',
      datumBesluit: string = '2024-07-26',
      titel = 'Productaanvraag',
      datumIngangGeldigheid = '2024-04-12',
      datumEindeGeldigheid = '2025-04-12'
    ) {
      return createAanvraag({
        leveringsVorm,
        productsoortCode,
        productIdentificatie,
        datumBesluit,
        titel,
        datumEindeGeldigheid,
        datumIngangGeldigheid,
      });
    }

    describe('Line item transformers not found', () => {
      const aanvraag = getAanvraagTransformed('PGB', 'MATCH');

      const lineItems = getStatusLineItems(
        'WMO',
        [lineItemsConfig1],
        aanvraag,
        [],
        new Date()
      );

      test('Get line items', () => {
        expect(lineItems).toBe(null);
        expect(logSpy).toHaveBeenCalledWith(
          `No line item formatters found for Service: WMO, resultaat: null, leveringsVorm: PGB, productsoortCode: MATCH, productIdentificatie: WORLD`
        );
      });
    });

    describe('Happy path: transforms data for 2 lineItems', () => {
      const aanvraag = getAanvraagTransformed();

      const lineItems = getStatusLineItems(
        'WMO',
        [lineItemsConfig1],
        aanvraag,
        [],
        new Date()
      );

      test('Added ids', () => {
        expect(lineItems![0].id).toBe(`status-step-0`);
        expect(lineItems![1].id).toBe(`status-step-1`);
      });

      test('Get line items length', () => {
        expect(lineItems?.length).toBe(2);
      });

      test('Resolves a dynamic status', () => {
        const lineItemsWithDynamicStatus = getStatusLineItems(
          'WMO',
          [
            {
              ...lineItemsConfig1,
              statusLineItems: {
                transformers: [
                  {
                    ...transformerConfig,
                    status: (currentAanvraag) =>
                      `Ontvangen op ${currentAanvraag.datumAanvraag}`,
                  },
                ],
              },
            },
          ],
          aanvraag,
          [],
          new Date()
        );

        expect(lineItemsWithDynamicStatus?.[0].status).toBe(
          'Ontvangen op 2024-01-01'
        );
      });

      const transformerMethods: Array<
        keyof ZorgnedStatusLineItemTransformerConfig
      > = ['datePublished', 'isChecked', 'isActive', 'description'];

      test.each(transformerMethods)(
        'Expect %s of transformer1 to have been called',
        (method) => {
          expect(transformerConfig[method]).toHaveBeenCalled();
        }
      );

      test.each(transformerMethods)(
        'Expect %s of transformer2 to have been called',
        (method) => {
          expect(transformerConfig2[method]).toHaveBeenCalled();
        }
      );
    });

    describe('Happy path: transforms data for 2 lineItems, returns one due to visibility filter', () => {
      const aanvraag = getAanvraagTransformed();

      const transformer1 = getTransformerConfig();
      const transformer2 = getTransformerConfig();

      transformer2.isVisible = vi.fn().mockReturnValueOnce(false);

      const lineItems = getStatusLineItems(
        'WMO',
        [
          {
            ...lineItemsConfig1,
            productgroep: 'Test line items 4',
            statusLineItems: {
              transformers: [transformer1, transformer2],
            },
          },
        ],
        aanvraag,
        [],
        new Date()
      );

      const transformerMethods: Array<
        keyof ZorgnedStatusLineItemTransformerConfig
      > = ['datePublished', 'isChecked', 'isActive', 'description'];

      test.each(transformerMethods)(
        'Expect %s of transformer1 to have been called',
        (method) => {
          expect(transformer1[method]).toHaveBeenCalled();
        }
      );

      test.each([
        ...transformerMethods,
        'isVisible',
      ] as typeof transformerMethods)(
        'Expect %s of transformer2 to have been called',
        (method) => {
          expect(transformer2[method]).toHaveBeenCalled();
        }
      );

      test('Get line items length', () => {
        expect(lineItems?.length).toBe(1);
      });
    });

    describe('Matches line items based on result', () => {
      const aanvraag = getAanvraagTransformed();

      // @ts-expect-error - Ignore possibly missing optional property for testing
      delete aanvraag.leveringsVorm;

      const transformer1 = getTransformerConfig();
      const transformer2 = getTransformerConfig();

      test.each([
        ['afgewezen', 'afgewezen', 2],
        ['toegewezen', 'afgewezen', undefined],
        ['afgewezen', 'toegewezen', undefined],
        ['toegewezen', 'toegewezen', 2],
        [undefined, 'toegewezen', 2],
        [undefined, 'afgewezen', 2],
      ])(
        'LineItemconfig resultaat: %s, aanvraag resultaat: %s',
        (resultaatMatch, resultaatAanvraag, expectedLength) => {
          const lineItems = getStatusLineItems(
            'WMO',
            [
              {
                resultaat: resultaatMatch as BeschikkingsResultaat,
                productgroep: 'Test line items 5',
                statusLineItems: {
                  transformers: [transformer1, transformer2],
                },
              },
            ],
            {
              ...aanvraag,
              resultaat: resultaatAanvraag as BeschikkingsResultaat,
            },
            [],
            new Date()
          );
          expect(lineItems?.length).toBe(expectedLength);
        }
      );
    });
  });
});
