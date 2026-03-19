import {
  isNotBestuurlijkGevoelig,
  isZaakWithValidResultaat,
} from '../../powerbrowser/powerbrowser-helpers';
import type {
  PBZaakResultaat,
  PBRecordField,
} from '../../powerbrowser/powerbrowser-types';

const resultatenVerleend = [
  'Gedeeltelijk verleend',
  'Van rechtswege verleend',
  'Vergunning gedeeltelijk ingetrokken',
  'Verleend',
];
const ResultatenValid = [
  ...resultatenVerleend,
  'Aanvraag ingetrokken',
  'Ander bevoegd gezag',
  'Buiten behandeling gesteld',
  'Geweigerd',
  'Vergunningsvrij',
];

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
  return resultatenVerleend.includes(resultaat.toLowerCase());
}

export function isValidVTHZaak(record: PBRecordField) {
  return (
    isNotBestuurlijkGevoelig(record) &&
    isZaakWithValidResultaat(record, ResultatenValid)
  );
}
