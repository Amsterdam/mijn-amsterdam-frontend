import { defaultDateFormat } from '../../../../universal/helpers/date.ts';
import type {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
  ZorgnedStatusLineItemsConfig,
} from '../../zorgned/zorgned-types.ts';
import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  hasDecision,
  hasMeerInformatieNodig,
  IN_BEHANDELING,
  isDecisionStatusActive,
  MEER_INFORMATIE,
} from '../wmo/status-line-items/wmo-generic.ts';

export function getMeerInformatieDate(
  aanvraag: ZorgnedAanvraagTransformed
): string {
  const actie = aanvraag?.procesAanvraagActies?.find(
    (actie) => actie.omschrijving.toLowerCase() === 'verzoek om meer informatie'
  );

  return actie?.datum ?? '';
}

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
  description: () => '<p>Uw melding is in behandeling bij de gemeente.</p>',
  isActive: (aanvraag: ZorgnedAanvraagTransformed) => !hasDecision(aanvraag),
  substeps: [
    {
      ...MEER_INFORMATIE,
      datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
        getMeerInformatieDate(aanvraag),
      hideDatePublished: true,
      isActive: (aanvraag: ZorgnedAanvraagTransformed) =>
        hasMeerInformatieNodig(aanvraag) && !hasDecision(aanvraag),
      description: `
<p>Wij kunnen uw melding nog niet beoordelen. Het kan zijn dat u nog informatie moet aanleveren. Dat kan door het op te sturen naar ons gratis antwoordnummer:</p>
<p>Gemeente Amsterdam<br />
Services & Data<br />
Antwoordnummer 9087<br />
1000 VV Amsterdam</p>`,
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
