import {
  isNotBestuurlijkGevoelig,
  isZaakWithValidResultaat,
} from '../../powerbrowser/powerbrowser-helpers.ts';
import type {
  PBZaakResultaat,
  PBZaakFieldsByName,
} from '../../powerbrowser/powerbrowser-types.ts';

const RESULTATEN_VERLEEND = [
  'Gedeeltelijk verleend',
  'Van rechtswege verleend',
  'Vergunning gedeeltelijk ingetrokken',
  'Verleend',
];
const RESULTATEN_NIET_VERLEEND = [
  'Aanvraag ingetrokken',
  'Ander bevoegd gezag',
  'Buiten behandeling gesteld',
  'Geweigerd',
  'Vergunningsvrij',
];
const RESULTATEN_VALID = [...RESULTATEN_VERLEEND, ...RESULTATEN_NIET_VERLEEND];

export function transformVTHZaakResult(
  resultaat: string | null
): 'Verleend' | 'Niet verleend' | string | null {
  if (resultaat === null) {
    return null;
  }

  switch (true) {
    case RESULTATEN_VERLEEND.includes(resultaat):
      return 'Verleend';
    case RESULTATEN_NIET_VERLEEND.includes(resultaat):
      return 'Niet verleend';
  }

  return resultaat;
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

export function isVTHZaakVerleend(resultaat: PBZaakResultaat) {
  if (!resultaat) {
    return false;
  }
  return RESULTATEN_VERLEEND.includes(resultaat.toLowerCase());
}

export function isValidVTHZaak(pbZaakFields: PBZaakFieldsByName) {
  return (
    isNotBestuurlijkGevoelig(pbZaakFields) &&
    isZaakWithValidResultaat(RESULTATEN_VALID, pbZaakFields)
  );
}
