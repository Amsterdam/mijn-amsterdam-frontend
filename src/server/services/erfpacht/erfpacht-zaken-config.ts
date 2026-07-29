import type {
  ZaakStatusTypeSource,
  ZaakStatusFrontend,
} from './erfpacht-zaken-types.ts';

export const ZAAK_STATUS_SOURCE = {
  AANVRAAG: 'aanvraag',
  AANVRAAG_BEOORDELEN: 'aanvraag beoordelen',
  AANVRAAG_GEREED_VOOR_BEHANDELING: 'aanvraag gereed voor behandeling',
  INFORMATIE_OPGEVRAAGD: 'informatie opgevraagd',
  INFORMATIE_AANGELEVERD: 'informatie aangeleverd',
  BEHANDELING: 'behandeling',
  INDICATIE_VERSTUURD: 'indicatie verstuurd',
  AANBIEDING: 'aanbieding',
  ACCEPTATIE_ONTVANGEN: 'acceptatie ontvangen',
  BESLUIT_VERSTUURD: 'besluit verstuurd',
  AKTE_GEPASSEERD: 'akte gepasseerd',
  AANVRAAG_AFGEROND: 'aanvraag afgerond',
} as const;

export const ZAAK_STATUS_FRONTEND = {
  AANVRAAG: 'Aanvraag',
  MEER_INFORMATIE_NODIG: 'Meer informatie nodig',
  IN_BEHANDELING: 'In behandeling',
  AFGEHANDELD: 'Afgehandeld',
} as const satisfies Record<string, ZaakStatusFrontend>;

export function getDisplayStatus(
  statustekst: ZaakStatusTypeSource
): ZaakStatusFrontend {
  switch (statustekst.toLowerCase()) {
    case ZAAK_STATUS_SOURCE.AANVRAAG:
    case ZAAK_STATUS_SOURCE.AANVRAAG_BEOORDELEN:
    case ZAAK_STATUS_SOURCE.AANVRAAG_GEREED_VOOR_BEHANDELING:
      return ZAAK_STATUS_FRONTEND.AANVRAAG;

    case ZAAK_STATUS_SOURCE.INFORMATIE_OPGEVRAAGD:
    case ZAAK_STATUS_SOURCE.INFORMATIE_AANGELEVERD:
      return ZAAK_STATUS_FRONTEND.MEER_INFORMATIE_NODIG;

    case ZAAK_STATUS_SOURCE.BEHANDELING:
    case ZAAK_STATUS_SOURCE.INDICATIE_VERSTUURD:
    case ZAAK_STATUS_SOURCE.AANBIEDING:
    case ZAAK_STATUS_SOURCE.ACCEPTATIE_ONTVANGEN:
    case ZAAK_STATUS_SOURCE.BESLUIT_VERSTUURD:
      return ZAAK_STATUS_FRONTEND.IN_BEHANDELING;

    case ZAAK_STATUS_SOURCE.AANVRAAG_AFGEROND:
      return ZAAK_STATUS_FRONTEND.AFGEHANDELD;

    default:
      return `${statustekst}`;
  }
}
