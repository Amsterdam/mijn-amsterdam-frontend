import {
  isNotBestuurlijkGevoelig,
  isZaakWithValidLowercasedResultaat,
} from '../../powerbrowser/powerbrowser-helpers.ts';
import type { PBZaakFieldsByName } from '../../powerbrowser/powerbrowser-types.ts';

const RESULTATEN_VERLEEND = [
  'Gedeeltelijk verleend',
  'Van rechtswege verleend',
  'Vergunning gedeeltelijk ingetrokken',
  'Verleend',
];
const RESULTATEN_VERLEEND_LOWERCASE = RESULTATEN_VERLEEND.map((resultaat) =>
  resultaat.toLowerCase()
);
const RESULTATEN_NIET_VERLEEND = [
  'Aanvraag ingetrokken',
  'Ander bevoegd gezag',
  'Buiten behandeling gesteld',
  'Geweigerd',
  'Vergunningsvrij',
];
const RESULTATEN_NIET_VERLEEND_LOWERCASE = RESULTATEN_NIET_VERLEEND.map(
  (resultaat) => resultaat.toLowerCase()
);
const RESULTATEN_VALID_LOWERCASE = [
  ...RESULTATEN_VERLEEND_LOWERCASE,
  ...RESULTATEN_NIET_VERLEEND_LOWERCASE,
];

export function isVTHZaakVerleend(zaak: { decision: string | null }): boolean {
  return (
    typeof zaak.decision === 'string' &&
    RESULTATEN_VERLEEND_LOWERCASE.includes(zaak.decision.toLowerCase())
  );
}

export function isValidVTHDocument(record: {
  SOORTDOCUMENT_ID: string;
  STAMCSSTATUS_ID: string;
}) {
  const isAanvraag = record.SOORTDOCUMENT_ID === '1000001015';
  const isBesluit = record.SOORTDOCUMENT_ID === '256';
  const isDefinitief = record.STAMCSSTATUS_ID === '1000001002';

  const isValid = isDefinitief && (isBesluit || isAanvraag);
  return isValid;
}

export function isValidVTHZaak(pbZaakFields: PBZaakFieldsByName) {
  return (
    isNotBestuurlijkGevoelig(pbZaakFields) &&
    isZaakWithValidLowercasedResultaat(RESULTATEN_VALID_LOWERCASE, pbZaakFields)
  );
}
