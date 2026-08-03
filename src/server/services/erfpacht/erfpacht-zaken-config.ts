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

export type ZaakStatusTypeSource =
  (typeof ZAAK_STATUS_SOURCE)[keyof typeof ZAAK_STATUS_SOURCE];

export const ZAAK_STATUS_FRONTEND = {
  AANVRAAG: 'Aanvraag',
  IN_BEHANDELING: 'In behandeling',
  AFGEHANDELD: 'Afgehandeld',
} as const;

export type ZaakStatusTypeFrontend =
  (typeof ZAAK_STATUS_FRONTEND)[keyof typeof ZAAK_STATUS_FRONTEND];

export function getParentStatus(statustekst: ZaakStatusTypeSource): string {
  switch (statustekst.toLowerCase()) {
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

export function translateSourceStatus(
  statustekst: ZaakStatusTypeSource
): string {
  switch (statustekst.toLowerCase()) {
    case ZAAK_STATUS_SOURCE.AANVRAAG:
      return 'Ontvangen';
    default:
      return `${statustekst}`;
  }
}
