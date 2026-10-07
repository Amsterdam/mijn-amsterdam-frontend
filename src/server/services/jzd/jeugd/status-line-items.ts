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

const ACTIE_IN_BEHANDELING_BIJ_GEMEENTE = 'In behandeling bij gemeente';
const ACTIE_VERZOEK_MEER_INFORMATIE = 'Verzoek om meer informatie';

function getInBehandelingBijGemeenteDate(aanvraag: ZorgnedAanvraagTransformed) {
  const latestActionDate = aanvraag.procesAanvraagActies
    ?.filter(
      (actie) => actie.omschrijving === ACTIE_IN_BEHANDELING_BIJ_GEMEENTE
    )
    .map((actie) => actie.datum)
    .filter((datum): datum is string => datum !== undefined)
    .toSorted()
    .at(-1);

  return latestActionDate || aanvraag.datumBesluit || '';
}

function hasInBehandelingBijGemeenteAction(
  aanvraag: ZorgnedAanvraagTransformed
) {
  return (
    aanvraag.procesAanvraagActieOmschrijvingen?.includes(
      ACTIE_IN_BEHANDELING_BIJ_GEMEENTE
    ) ?? false
  );
}

function hasMoreInformationFollowUp(aanvraag: ZorgnedAanvraagTransformed) {
  const acties = aanvraag.procesAanvraagActieOmschrijvingen ?? [];
  return (
    acties.includes(ACTIE_VERZOEK_MEER_INFORMATIE) &&
    acties.filter((actie) => actie === ACTIE_IN_BEHANDELING_BIJ_GEMEENTE)
      .length > 1
  );
}

const ONTVANGEN = {
  ...AANVRAAG,
  status: 'Ontvangen',
  datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
    aanvraag.datumAanvraag,
  hideDateInProgressList: true,
  description: (aanvraag: ZorgnedAanvraagTransformed) =>
    '<p>Ontvangen op ' + defaultDateFormat(aanvraag.datumAanvraag) + '</p>',
};

const BEHANDELING_INDICATIEADVISEUR = {
  ...IN_BEHANDELING,
  status: 'Behandeling bij indicatieadviseur',
  datePublished: getInBehandelingBijGemeenteDate,
  // We hide the date within the Progress List as the date will change when the action is finished. Which is confusing for the user if we would show it.
  hideDateInProgressList: true,
  description: () =>
    '<p>Uw melding wordt behandeld door een indicatieadviseur.</p>',
  isActive: (aanvraag: ZorgnedAanvraagTransformed) =>
    hasInBehandelingBijGemeenteAction(aanvraag) && !hasDecision(aanvraag),
  substeps: [
    {
      ...MEER_INFORMATIE,
      datePublished: '',
      isActive: (aanvraag: ZorgnedAanvraagTransformed) =>
        hasMeerInformatieNodig(aanvraag) &&
        !hasDecision(aanvraag) &&
        !hasMoreInformationFollowUp(aanvraag),
      description: `
<p>Wij kunnen uw aanvraag nog niet beoordelen. U moet meer informatie aanleveren. Dat kan door het op te sturen naar ons gratis antwoordnummer:</p>
<p>Gemeente Amsterdam<br />
Services & Data<br />
Antwoordnummer 9087<br />
1000 VV Amsterdam</p>`,
    },
    {
      status: 'Meer informatie in behandeling',
      datePublished: '',
      description: () =>
        '<p>De door u aangeleverde informatie wordt behandeld.</p>',
      isChecked: true,
      isActive: (aanvraag: ZorgnedAanvraagTransformed) =>
        hasMoreInformationFollowUp(aanvraag) && !hasDecision(aanvraag),
      isVisible: hasMoreInformationFollowUp,
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
