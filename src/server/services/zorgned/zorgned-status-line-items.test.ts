import { forTesting, getStatusLineItems } from './zorgned-status-line-items.ts';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemsConfig,
  ZorgnedStatusLineItemTransformerConfig,
} from './zorgned-types.ts';
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

const transformerConfigs = [transformerConfig, transformerConfig2];

const lineItemsConfig1: ZorgnedStatusLineItemsConfig = {
  leveringsVorm: 'FOO',
  productsoortCodes: ['BAR', 'FOO'],
  lineItemTransformers: [transformerConfig, transformerConfig2],
};

const lineItemsConfig2: ZorgnedStatusLineItemsConfig = {
  productIdentificatie: ['BAR'],
  lineItemTransformers: [transformerConfig2],
  filter(aanvraag) {
    return aanvraag.betrokkenen?.includes('B');
  },
};

const lineItemsConfig3: ZorgnedStatusLineItemsConfig = {
  productIdentificatie: ['BAR'],
  filter(aanvraag) {
    return aanvraag.betrokkenen?.includes('A');
  },
  lineItemTransformers: [transformerConfig],
};

const lineItemConfigs = [lineItemsConfig1, lineItemsConfig2, lineItemsConfig3];

describe('zorgned-status-line-items', () => {
  const logSpy = vi.spyOn(logger, 'error');

  describe('getStatusLineItemTransformers', () => {
    test('Get transformers', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        {
          leveringsVorm: 'FOO',
          productsoortCode: 'BAR',
        } as ZorgnedAanvraagTransformed,
        []
      );

      expect(lineItemTransformers).toStrictEqual(transformerConfigs);
    });

    test('Get transformers: ProductIdentificatie', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        {
          leveringsVorm: 'BLA',
          productsoortCode: 'ALB',
          productIdentificatie: 'BAR',
          betrokkenen: ['B'],
        } as ZorgnedAanvraagTransformed,
        []
      );

      expect(lineItemTransformers).toStrictEqual([transformerConfig2]);
    });

    test('Get transformers: filter match based on Betrokkenen', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        {
          betrokkenen: ['B'],
          leveringsVorm: '',
          productsoortCode: '',
          productIdentificatie: 'BAR',
        } as ZorgnedAanvraagTransformed,
        []
      );

      expect(lineItemTransformers).toStrictEqual([transformerConfig2]);

      const lineItemTransformers2 = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        {
          betrokkenen: ['A'],
          leveringsVorm: '',
          productsoortCode: '',
          productIdentificatie: 'BAR',
        } as ZorgnedAanvraagTransformed,
        []
      );

      expect(lineItemTransformers2).toStrictEqual([transformerConfig]);
    });

    test('Get transformers: No match for leveringsvorm and productsoortCode', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        {
          leveringsVorm: 'BLA',
          productsoortCode: 'ALB',
        } as ZorgnedAanvraagTransformed,
        []
      );

      expect(lineItemTransformers).toBe(undefined);
    });

    test('Get transformers: No match for productSoortCode or productIdentificatie', () => {
      const lineItemTransformers = forTesting.getStatusLineItemTransformers(
        lineItemConfigs,
        {
          leveringsVorm: 'FOO',
          productsoortCode: '',
          productIdentificatie: 'FOO',
        } as ZorgnedAanvraagTransformed,
        []
      );

      expect(lineItemTransformers).toBe(undefined);
    });
  });

  describe('getStatusLineItems', () => {
    function getAanvraagTransformed(
      leveringsVorm: string = 'FOO',
      productsoortCode: string = 'BAR',
      productIdentificatie: string = 'WORLD',
      datumBesluit: string = '2024-07-26',
      titel = 'Productaanvraag',
      datumIngangGeldigheid = '2024-04-12',
      datumEindeGeldigheid = '2025-04-12'
    ) {
      return {
        leveringsVorm,
        productsoortCode,
        productIdentificatie,
        datumBesluit,
        titel,
        datumEindeGeldigheid,
        datumIngangGeldigheid,
      } as ZorgnedAanvraagTransformed;
    }

    describe('Line item transformers not found', () => {
      const aanvraag = getAanvraagTransformed('NO', 'MATCH');

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
          `No line item formatters found for Service: WMO, leveringsVorm: NO, productsoortCode: MATCH, productIdentificatie: WORLD`
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
            lineItemTransformers: [transformer1, transformer2],
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
  });
});
