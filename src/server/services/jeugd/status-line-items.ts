import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isDecisionStatusActive,
  MEER_INFORMATIE,
} from '../wmo/status-line-items/wmo-generic.ts';
import type { ZorgnedStatusLineItemsConfig } from '../zorgned/zorgned-types.ts';

export const jeugdStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    productgroep: 'leerlingenvervoer',
    productIdentificatie: [
      'LLVFV',
      'LLVOVA',
      'LLVOVV',
      'LLVEV',
      'LLVAV',
      'LLVAVG',
    ],
    statusLineItems: {
      transformers: [
        AANVRAAG,
        IN_BEHANDELING,
        {
          ...MEER_INFORMATIE,
          description: `
<p>Wij kunnen uw aanvraag nog niet beoordelen. U moet meer informatie aanleveren. Dat kan door het op te sturen naar ons gratis antwoordnummer:</p>
<p>Gemeente Amsterdam<br />
Services & Data<br />
Antwoordnummer 9087<br />
1000 VV Amsterdam</p>`,
        },
        getTransformerConfigBesluit(isDecisionStatusActive, false),
        EINDE_RECHT,
      ],
    },
  },
];
