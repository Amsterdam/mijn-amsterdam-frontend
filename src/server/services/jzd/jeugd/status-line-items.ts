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
import {
  ACTIE_IN_BEHANDELING,
  ACTIE_VERZOEK_MEER_INFORMATIE,
  STATUS_ONTVANGEN,
} from '../wmo/wmo-config.ts';

const ONTVANGEN = {
  ...AANVRAAG,
  status: STATUS_ONTVANGEN,
  datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
    aanvraag.datumAanvraag,
  hideDatePublished: true,
  description: (aanvraag: ZorgnedAanvraagTransformed) =>
    '<p>Ontvangen op ' + defaultDateFormat(aanvraag.datumAanvraag) + '</p>',
};

const MELDING_IN_BEHANDELING = {
  ...IN_BEHANDELING,
  datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
    aanvraag.datumAanvraag,
  description: () => '<p>Uw melding is in behandeling.</p>',
  isActive: (aanvraag: ZorgnedAanvraagTransformed) => !hasDecision(aanvraag),
  substeps: [
    {
      ...MEER_INFORMATIE,
      datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
        getActionDate(aanvraag, ACTIE_VERZOEK_MEER_INFORMATIE) ?? '',
      isActive: (aanvraag: ZorgnedAanvraagTransformed) =>
        hasAction(aanvraag, ACTIE_VERZOEK_MEER_INFORMATIE) &&
        !hasAction(aanvraag, ACTIE_IN_BEHANDELING),
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
  MELDING_IN_BEHANDELING,
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
