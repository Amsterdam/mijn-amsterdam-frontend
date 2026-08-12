import type { ZorgnedStatusLineItemsConfig } from '../../zorgned/zorgned-types.ts';
import {
  AANVRAAG,
  EINDE_RECHT,
  getActieBasedMeerInformatieStep,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isActiesBasedAanvraag,
  isDecisionStatusActive,
  MEER_INFORMATIE,
} from '../wmo/status-line-items/wmo-generic.ts';

export const llvStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    productgroep: 'leerlingenvervoer',
    productIdentificatie: [
      'LLVFV',
      'LLVOVA',
      'LLVOVV',
      'LLVEV',
      'LLVAV',
      'LLVAVG',
      null, // For actie based aanvragen.
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
        // The 2nd IN_BEHANDELING step should only be visible if the MEER_INFORMATIE step is completed.
        // This is because the MEER_INFORMATIE step is optional and we don't want to show the IN_BEHANDELING step twice.
        {
          ...IN_BEHANDELING,
          isVisible: (aanvraag) => {
            if (isActiesBasedAanvraag(aanvraag)) {
              return (
                getActieBasedMeerInformatieStep(aanvraag)?.status === 'Klaar'
              );
            }
            return false;
          },
        },
        getTransformerConfigBesluit(isDecisionStatusActive, false),
        EINDE_RECHT,
      ],
    },
  },
];
