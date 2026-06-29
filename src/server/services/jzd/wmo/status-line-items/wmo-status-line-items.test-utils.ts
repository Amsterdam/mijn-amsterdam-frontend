import { expect } from 'vitest';

import { getStatusLineItems } from '../../../zorgned/zorgned-status-line-items.ts';
import type {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
  ZorgnedStatusLineItemsConfig,
} from '../../../zorgned/zorgned-types.ts';

export const today = new Date('2024-06-15T00:00:00.000Z');

export const DOC_BESLUIT = {
  id: 'doc-besluit',
  title: 'Besluit: toekenning',
  datePublished: '2024-06-10',
  url: '/documenten/doc-besluit',
};

export const DOC_MEER_INFORMATIE = {
  id: 'doc-verzoek',
  title: 'Verzoek: aanvullende gegevens',
  datePublished: '2024-06-09',
  url: '/documenten/doc-verzoek',
};

export function getAanvraagTransformed(
  overrides: Partial<ZorgnedAanvraagTransformed> = {}
): ZorgnedAanvraagTransformed {
  return {
    betrokkenen: [],
    datumAanvraag: '2024-01-01',
    datumBeginLevering: null,
    datumBesluit: '2024-06-01',
    datumEindeGeldigheid: '2099-01-01',
    datumEindeLevering: null,
    datumIngangGeldigheid: '2024-07-01',
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    procesAanvraagOmschrijving: null,
    documenten: [],
    id: 'aanvraag-1',
    prettyID: 'WMO-1',
    procesIdentificatie: 'proces-1',
    procesMeldingIdentificatie: null,
    isActueel: true,
    leverancier: 'Woningpartner',
    leverancierIdentificatie: 'leverancier-1',
    leveringsVorm: 'ZIN',
    productsoortCode: 'WRA',
    beschiktProductIdentificatie: 'beschikt-product-1',
    beschikkingNummer: 1,
    resultaat: 'toegewezen',
    titel: 'woonaanpassing',
    ...overrides,
  };
}

export function getVisibleStatusLineItems(
  transformers: ZorgnedStatusLineItemTransformerConfig[],
  aanvraag: ZorgnedAanvraagTransformed
) {
  const config: ZorgnedStatusLineItemsConfig[] = [
    {
      productgroep: 'test',
      statusLineItems: {
        transformers,
      },
    },
  ];

  const lineItems = getStatusLineItems(
    'WMO',
    config,
    aanvraag,
    [aanvraag],
    today
  );

  expect(lineItems).not.toBeNull();

  return lineItems!;
}
