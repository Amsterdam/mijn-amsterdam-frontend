export const SELECT_FIELDS_TRANSFORM_BASE = {
  ZAAK_IDENTIFICATIE: 'zaaknummer',
  EINDDATUM: 'dateDecision',
  DATUM_TOT: 'dateEnd',
  RESULTAAT_ID: 'result',
  STARTDATUM: 'dateReceived',
};

export const PB_VERLEEND_DECISIONS_COMMOM = [
  'Verleend met overgangsrecht',
  'Verleend zonder overgangsrecht',
  'Verleend',
  'Van rechtswege verleend',
  'Gedeeltelijk verleend',
];

export const PB_NIETVERLEEND_DECISIONS_COMMOM = [
  'Geweigerd op basis van Quotum',
  'Geweigerd',
  'Geweigerd met overgangsrecht',
  'Buiten behandeling',
];

export const PB_INGETROKKEN_DECISIONS_COMMOM = [
  'Ingetrokken',
  'Vergunning ingetrokken',
];
