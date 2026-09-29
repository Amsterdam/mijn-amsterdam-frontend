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

const MELDING_ONTVANGEN = {
  ...AANVRAAG,
  status: 'Melding ontvangen',
  datePublished: (aanvraag: ZorgnedAanvraagTransformed) =>
    aanvraag.datumAanvraag,
  description: () => '<p>Uw melding is ontvangen.</p>',
};

const BEHANDELING_INDICATIEADVISEUR = {
  ...IN_BEHANDELING,
  status: 'Behandeling bij indicatieadviseur',
  datePublished: '',
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
  MELDING_ONTVANGEN,
  BEHANDELING_INDICATIEADVISEUR,
  getTransformerConfigBesluit(isDecisionStatusActive, false),
  EINDE_RECHT,
];

export const jeugdStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    productgroep: 'leerlingenvervoer',
    regelingIdentificatie: 'LLV',
    statusLineItems: {
      transformers,
    },
  },
];
