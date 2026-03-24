import {
  isNotBestuurlijkGevoelig,
  isZaakWithValidResultaat,
} from '../../powerbrowser/powerbrowser-helpers.ts';
import type { PBZaakFieldsByName } from '../../powerbrowser/powerbrowser-types.ts';

const RESULTATEN_VERLEEND = {
  'gedeeltelijk verleend': 'Gedeeltelijk verleend',
  'van rechtswege verleend': 'Van rechtswege verleend',
  'vergunning gedeeltelijk ingetrokken': 'Vergunning gedeeltelijk ingetrokken',
  verleend: 'Verleend',
} as const;

const RESULTATEN_NIET_VERLEEND = {
  'aanvraag ingetrokken': 'Aanvraag ingetrokken',
  'ander bevoegd gezag': 'Ander bevoegd gezag',
  'buiten behandeling gesteld': 'Buiten behandeling gesteld',
  geweigerd: 'Geweigerd',
  vergunningsvrij: 'Vergunningsvrij',
} as const;

const RESULTATEN_VALID = {
  ...RESULTATEN_VERLEEND,
  ...RESULTATEN_NIET_VERLEEND,
} as const;

export function transformVTHZaakResult(
  resultaat: string | null
): (typeof RESULTATEN_VALID)[keyof typeof RESULTATEN_VALID] | null {
  if (resultaat == null) {
    return null;
  }

  const translatedResultaat =
    RESULTATEN_VALID[resultaat as keyof typeof RESULTATEN_VALID];
  if (translatedResultaat) {
    return translatedResultaat;
  }

  const resultaten = Object.values(RESULTATEN_VALID) as string[];
  const match = resultaten.includes(resultaat);
  if (match) {
    return resultaat as (typeof RESULTATEN_VALID)[keyof typeof RESULTATEN_VALID];
  }

  return null;
}

export function isVTHZaakVerleend(zaak: { decision: string | null }): boolean {
  const verleendValues = Object.values(RESULTATEN_VERLEEND) as string[];
  return (
    typeof zaak.decision === 'string' && verleendValues.includes(zaak.decision)
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

// pbZaakFields param contains the untranslated fieldValues. Therefore we have to check both keys and values of RESULTATEN_VALID
const resultatenValidAll = [
  ...Object.keys(RESULTATEN_VALID),
  ...Object.values(RESULTATEN_VALID),
];
export function isValidVTHZaak(pbZaakFields: PBZaakFieldsByName) {
  return (
    isNotBestuurlijkGevoelig(pbZaakFields) &&
    isZaakWithValidResultaat(resultatenValidAll, pbZaakFields)
  );
}
