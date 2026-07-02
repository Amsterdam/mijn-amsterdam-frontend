import { describe, expect, it } from 'vitest';

import { WMO_AFWIJZING_ALL } from './status-line-items/wmo-afwijzing-all.ts';
import { AOV } from './status-line-items/wmo-aov.ts';
import { diensten } from './status-line-items/wmo-diensten.ts';
import { hulpmiddelen } from './status-line-items/wmo-hulpmiddelen.ts';
import { PGB } from './status-line-items/wmo-pgb.ts';
import { vergoeding } from './status-line-items/wmo-vergoeding.ts';
import { WRA } from './status-line-items/wmo-wra.ts';
import { wmoStatusLineItemsConfig } from './wmo-status-line-items.ts';
import { forTesting } from '../../zorgned/zorgned-status-line-items.ts';
import type {
  BeschikkingsResultaat,
  LeveringsVormTransformed,
  ProductSoortCode,
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types.ts';

type TransformerVariantCase = {
  name: string;
  resultaat: BeschikkingsResultaat;
  leveringsVorm: LeveringsVormTransformed;
  productsoortCode: ProductSoortCode;
  expectedTransformers: ZorgnedStatusLineItemTransformerConfig[];
};

function getAanvraag({
  resultaat,
  leveringsVorm,
  productsoortCode,
}: Pick<
  TransformerVariantCase,
  'resultaat' | 'leveringsVorm' | 'productsoortCode'
>): ZorgnedAanvraagTransformed {
  return {
    betrokkenen: [],
    datumAanvraag: '2024-01-01',
    datumBeginLevering: null,
    datumBesluit: '2024-01-02',
    datumEindeGeldigheid: null,
    datumEindeLevering: null,
    datumIngangGeldigheid: null,
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    procesAanvraagOmschrijving: null,
    documenten: [],
    id: 'test-id',
    prettyID: 'WMO-1',
    procesIdentificatie: 'proces-1',
    procesMeldingIdentificatie: null,
    isActueel: true,
    leverancier: 'Test Leverancier',
    leverancierIdentificatie: 'leverancier-1',
    leveringsVorm,
    productsoortCode,
    beschiktProductIdentificatie: 'beschikt-product-1',
    beschikkingNummer: 1,
    resultaat,
    titel: 'Test voorziening',
  };
}

const transformerVariantCases: TransformerVariantCase[] = [
  {
    name: 'all rejected decisions',
    resultaat: 'afgewezen',
    leveringsVorm: '',
    productsoortCode: 'UNKNOWN',
    expectedTransformers: WMO_AFWIJZING_ALL,
  },
  {
    name: 'WRA with ZIN delivery',
    resultaat: 'toegewezen',
    leveringsVorm: 'ZIN',
    productsoortCode: 'WRA',
    expectedTransformers: WRA,
  },
  {
    name: 'hulpmiddelen with ZIN delivery',
    resultaat: 'toegewezen',
    leveringsVorm: 'ZIN',
    productsoortCode: 'AUT',
    expectedTransformers: hulpmiddelen,
  },
  {
    name: 'diensten with ZIN delivery',
    resultaat: 'toegewezen',
    leveringsVorm: 'ZIN',
    productsoortCode: 'AO1',
    expectedTransformers: diensten,
  },
  {
    name: 'diensten without delivery form',
    resultaat: 'toegewezen',
    leveringsVorm: '',
    productsoortCode: 'KVB',
    expectedTransformers: diensten,
  },
  {
    name: 'PGB delivery',
    resultaat: 'toegewezen',
    leveringsVorm: 'PGB',
    productsoortCode: 'AO3',
    expectedTransformers: PGB,
  },
  {
    name: 'vergoeding with ZIN delivery',
    resultaat: 'toegewezen',
    leveringsVorm: 'ZIN',
    productsoortCode: 'FIN',
    expectedTransformers: vergoeding,
  },
  {
    name: 'vergoeding with PGB delivery',
    resultaat: 'toegewezen',
    leveringsVorm: 'PGB',
    productsoortCode: 'PER',
    expectedTransformers: vergoeding,
  },
  {
    name: 'vergoeding without delivery form',
    resultaat: 'toegewezen',
    leveringsVorm: '',
    productsoortCode: 'VVK',
    expectedTransformers: vergoeding,
  },
  {
    name: 'AOV for all delivery forms',
    resultaat: 'toegewezen',
    leveringsVorm: 'ZIN',
    productsoortCode: 'AOV',
    expectedTransformers: AOV,
  },
];

describe('wmo-status-line-items', () => {
  it('keeps the variant cases aligned with the exported config list', () => {
    expect(transformerVariantCases).toHaveLength(
      wmoStatusLineItemsConfig.length
    );
  });

  it.each(transformerVariantCases)(
    'selects the correct transformers for $name',
    ({ resultaat, leveringsVorm, productsoortCode, expectedTransformers }) => {
      const aanvraag = getAanvraag({
        resultaat,
        leveringsVorm,
        productsoortCode,
      });

      const transformers = forTesting.getStatusLineItemTransformers(
        wmoStatusLineItemsConfig,
        aanvraag,
        [aanvraag]
      );

      expect(transformers).toBe(expectedTransformers);
    }
  );
});
