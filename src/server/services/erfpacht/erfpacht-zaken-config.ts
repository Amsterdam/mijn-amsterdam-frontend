import type {
  ZaakStatusTypeSource,
  ZaakStatusFrontend,
} from './erfpacht-zaken-types.ts';

export const ZAAK_SOURCE_STATUS = {
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

export const ZAAK_FRONTEND_STATUS = {
  AANVRAAG: 'Aanvraag',
  MEER_INFORMATIE_NODIG: 'Meer informatie nodig',
  IN_BEHANDELING: 'In behandeling',
  AFGEHANDELD: 'Afgehandeld',
} as const satisfies Record<string, ZaakStatusFrontend>;

export function getStatus(
  statustekst: ZaakStatusTypeSource
): ZaakStatusFrontend {
  switch (statustekst.toLowerCase()) {
    case ZAAK_SOURCE_STATUS.AANVRAAG:
    case ZAAK_SOURCE_STATUS.AANVRAAG_BEOORDELEN:
    case ZAAK_SOURCE_STATUS.AANVRAAG_GEREED_VOOR_BEHANDELING:
      return ZAAK_FRONTEND_STATUS.AANVRAAG;

    case ZAAK_SOURCE_STATUS.INFORMATIE_OPGEVRAAGD:
    case ZAAK_SOURCE_STATUS.INFORMATIE_AANGELEVERD:
      return ZAAK_FRONTEND_STATUS.MEER_INFORMATIE_NODIG;

    case ZAAK_SOURCE_STATUS.BEHANDELING:
    case ZAAK_SOURCE_STATUS.INDICATIE_VERSTUURD:
    case ZAAK_SOURCE_STATUS.AANBIEDING:
    case ZAAK_SOURCE_STATUS.ACCEPTATIE_ONTVANGEN:
    case ZAAK_SOURCE_STATUS.BESLUIT_VERSTUURD:
      return ZAAK_FRONTEND_STATUS.IN_BEHANDELING;

    case ZAAK_SOURCE_STATUS.AANVRAAG_AFGEROND:
      return ZAAK_FRONTEND_STATUS.AFGEHANDELD;

    default:
      return `${statustekst}`;
  }
}
