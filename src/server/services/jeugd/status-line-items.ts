import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isDecisionStatusActive,
  MEER_INFORMATIE,
} from '../wmo/status-line-items/wmo-generic';
import { ZorgnedStatusLineItemsConfig } from '../zorgned/zorgned-types';

export const jeugdStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    productIdentificatie: [
      'LLVFV',
      'LLVOVA',
      'LLVOVV',
      'LLVEV',
      'LLVAV',
      'LLVAVG',
    ],
    lineItemTransformers: [
      AANVRAAG,
      IN_BEHANDELING,
      {
        ...MEER_INFORMATIE,
        description: `
<p>Wij kunnen uw aanvraag nog niet beoordelen. U moet meer informatie aanleveren. Dat kan door het op te sturen naar ons gratis antwoordnummer:
Gemeente Amsterdam
Services & Data
Antwoordnummer 9087
1000 VV Amsterdam</p>`,
      },
      getTransformerConfigBesluit(isDecisionStatusActive, false),
      EINDE_RECHT,
    ],
  },
];
