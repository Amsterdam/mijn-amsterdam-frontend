import type {
  ZaakStatusFrontend,
  ZaakStatusSource,
} from './erfpacht-zaken-types.ts';
import type { StatusLineItem } from '../../../universal/types/App.types.ts';

const ZAAK_STATUS_SOURCE_ = {
  AANVRAAG: 'Aanvraag',
  AANVRAAG_BEOORDELEN: 'Aanvraag Beoordelen',
  AANVRAAG_GEREED_VOOR_BEHANDELING: 'Aanvraag gereed voor behandeling',
  INFORMATIE_OPGEVRAAGD: 'Informatie opgevraagd',
  INFORMATIE_AANGELEVERD: 'Informatie aangeleverd',
  BEHANDELING: 'Behandeling',
  INDICATIE_VERSTUURD: 'Indicatie verstuurd',
  AANBIEDING: 'Aanbieding',
  ACCEPTATIE_ONTVANGEN: 'Acceptatie ontvangen',
  BESLUIT_VERSTUURD: 'Besluit verstuurd',
  AKTE_GEPASSEERD: 'Akte gepasseerd',
  AANVRAAG_AFGEROND: 'Aanvraag afgerond',
} as const;

export type ZaakStatusTypeSource =
  (typeof ZAAK_STATUS_SOURCE_)[keyof typeof ZAAK_STATUS_SOURCE_];

export const ZAAK_STATUS_FRONTEND = {
  AANVRAAG: 'Aanvraag',
  IN_BEHANDELING: 'In behandeling',
  AFGEHANDELD: 'Afgehandeld',
} as const;

export type ZaakStatusTypeFrontend =
  (typeof ZAAK_STATUS_FRONTEND)[keyof typeof ZAAK_STATUS_FRONTEND];

export const ZAAK_STATUS_SOURCE = Object.fromEntries(
  Object.entries(ZAAK_STATUS_SOURCE_).map(([key, value]) => [
    key,
    value.toLowerCase(),
  ])
) as Record<keyof typeof ZAAK_STATUS_SOURCE_, string>;

export function getParentStatus(statustekst: ZaakStatusTypeSource): string {
  const statustekst_ = statustekst.toLowerCase();

  switch (statustekst_) {
    case ZAAK_STATUS_SOURCE.AANVRAAG:
    case ZAAK_STATUS_SOURCE.AANVRAAG_BEOORDELEN:
    case ZAAK_STATUS_SOURCE.INFORMATIE_OPGEVRAAGD:
    case ZAAK_STATUS_SOURCE.INFORMATIE_AANGELEVERD:
    case ZAAK_STATUS_SOURCE.AANVRAAG_GEREED_VOOR_BEHANDELING:
      return ZAAK_STATUS_FRONTEND.AANVRAAG;

    case ZAAK_STATUS_SOURCE.BEHANDELING:
    case ZAAK_STATUS_SOURCE.AANBIEDING:
    case ZAAK_STATUS_SOURCE.ACCEPTATIE_ONTVANGEN:
    case ZAAK_STATUS_SOURCE.BESLUIT_VERSTUURD:
    case ZAAK_STATUS_SOURCE.INDICATIE_VERSTUURD:
      return ZAAK_STATUS_FRONTEND.IN_BEHANDELING;

    case ZAAK_STATUS_SOURCE.AANVRAAG_AFGEROND:
      return ZAAK_STATUS_FRONTEND.AFGEHANDELD;

    default:
      return `${statustekst}`;
  }
}

export function getSubStepDescription(substep: ZaakStatusSource): string {
  switch (substep.statustoelichting.toLowerCase()) {
    case ZAAK_STATUS_SOURCE.AANVRAAG:
      return 'Wij hebben uw aanvraag ontvangen en gaan deze beoordelen.';
    case ZAAK_STATUS_SOURCE.AANVRAAG_BEOORDELEN:
      return 'Wij zijn bezig met het beoordelen van uw aanvraag.';
    case ZAAK_STATUS_SOURCE.INFORMATIE_OPGEVRAAGD:
      return 'Wij hebben aanvullende informatie nodig om uw aanvraag te kunnen beoordelen.';
    case ZAAK_STATUS_SOURCE.INFORMATIE_AANGELEVERD:
      return 'Wij hebben de aanvullende informatie ontvangen en gaan uw aanvraag verder beoordelen.';
    case ZAAK_STATUS_SOURCE.AANVRAAG_GEREED_VOOR_BEHANDELING:
      return 'Uw aanvraag is gereed voor behandeling.';
    case ZAAK_STATUS_SOURCE.INDICATIE_VERSTUURD:
      return 'Wij hebben u een indicatie gestuurd over de uitkomst van uw aanvraag.';
    case ZAAK_STATUS_SOURCE.AANBIEDING:
      return 'Wij hebben u een aanbieding gestuurd over de uitkomst van uw aanvraag.';
    case ZAAK_STATUS_SOURCE.ACCEPTATIE_ONTVANGEN:
      return 'Wij hebben uw acceptatie ontvangen en gaan uw aanvraag verder behandelen.';
    case ZAAK_STATUS_SOURCE.BESLUIT_VERSTUURD:
      return 'Wij hebben het besluit naar de notaris gestuurd. U ontvangt van de notaris een uitnodiging om de akte te passeren.';
    case ZAAK_STATUS_SOURCE.AKTE_GEPASSEERD:
      return 'Wij hebben de akte gepasseerd en uw aanvraag is afgerond.';
    case ZAAK_STATUS_SOURCE.BEHANDELING:
      return 'Wij zijn bezig met het behandelen van uw aanvraag.';
    case ZAAK_STATUS_SOURCE.AANVRAAG_AFGEROND:
      return 'Uw aanvraag is afgerond.';
  }
  return '';
}
export function getMainStepDescription(
  statusFixed: ZaakStatusFrontend,
  substeps: StatusLineItem<string>[]
): string {
  switch (true) {
    case statusFixed === ZAAK_STATUS_FRONTEND.AFGEHANDELD && !substeps?.length:
      return 'Zodra uw aanvraag is afgerond, ontvangt u van ons een bericht.';
    case statusFixed === ZAAK_STATUS_FRONTEND.IN_BEHANDELING &&
      !substeps?.length:
      return 'Uw aanvraag wordt eerst beoordeeld. Zodra wij hier mee klaar zijn nemen we uw zaak in behandeling.';
    default:
      return '';
  }
}
