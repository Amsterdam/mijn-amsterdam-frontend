import { defaultDateFormat } from '../../../../universal/helpers/date.ts';
import type {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemsConfig,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types.ts';
import {
  AANVRAAG,
  EINDE_RECHT,
  getActionDate,
  getTransformerConfigBesluit,
  hasAction,
  hasDecision,
  IN_BEHANDELING,
  isDecisionStatusActive,
  MEER_INFORMATIE,
  MEER_INFORMATIE_ONTVANGEN,
} from '../wmo/status-line-items/wmo-generic.ts';

const ONTVANGEN = {
  ...AANVRAAG,
  status: 'Ontvangen',
  datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
    aanvraag.datumAanvraag,
  hideDatePublished: true,
  description: (aanvraag: ZorgnedAanvraagTransformed) =>
    '<p>Ontvangen op ' + defaultDateFormat(aanvraag.datumAanvraag) + '</p>',
};

const BEHANDELING_INDICATIEADVISEUR = {
  ...IN_BEHANDELING,
  datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
    aanvraag.datumAanvraag,
  description: () => '<p>Uw melding is in behandeling.</p>',
  isActive: (aanvraag: ZorgnedAanvraagTransformed) => !hasDecision(aanvraag),
  substeps: [
    {
      ...MEER_INFORMATIE,
      datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
        getActionDate(aanvraag, 'verzoek om meer informatie') ?? '',
      isActive: (aanvraag: ZorgnedAanvraagTransformed) =>
        hasAction(aanvraag, 'verzoek om meer informatie') &&
        !hasAction(aanvraag, 'in behandeling bij gemeente'),
      description: `
<p>Wij kunnen uw melding nog niet beoordelen. Het kan zijn dat u nog informatie moet aanleveren. Dat kan door het op te sturen naar ons gratis antwoordnummer:</p>
<p>Gemeente Amsterdam<br />
Services & Data<br />
Antwoordnummer 9087<br />
1000 VV Amsterdam</p>`,
    },
    {
      ...MEER_INFORMATIE_ONTVANGEN,
    },
  ],
};

const transformers: ZorgnedStatusLineItemTransformerConfig[] = [
  ONTVANGEN,
  BEHANDELING_INDICATIEADVISEUR,
  getTransformerConfigBesluit(isDecisionStatusActive, false),
  EINDE_RECHT,
];

export const jeugdStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    productgroep: 'leerlingenvervoer',
    statusLineItems: {
      transformers,
    },
  },
];
