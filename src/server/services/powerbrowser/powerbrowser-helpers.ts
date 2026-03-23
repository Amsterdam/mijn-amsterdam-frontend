import type { PBRecordField } from './powerbrowser-types.ts';

export function hasCaseTypeInFMT_CAPTION(
  caseType: string,
  pbRecordFields: PBRecordField<string>[]
) {
  return pbRecordFields.some(
    (pbRecordField) =>
      pbRecordField.fieldName === 'FMT_CAPTION' &&
      !!pbRecordField.text &&
      pbRecordField.text?.includes(caseType)
  );
}

export function hasStringInZAAKPRODUCT_ID(
  str: string,
  pbRecordFields: PBRecordField<string>[]
) {
  return pbRecordFields.some(
    (pbRecordField) =>
      pbRecordField.fieldName === 'ZAAKPRODUCT_ID' &&
      !!pbRecordField.text &&
      pbRecordField.text?.includes(str)
  );
}

export function hasStringInZAAK_SUBPRODUCT_ID(
  str: string,
  pbRecordFields: PBRecordField<string>[]
) {
  return pbRecordFields.some(
    (pbRecordField) =>
      pbRecordField.fieldName === 'ZAAK_SUBPRODUCT_ID' &&
      !!pbRecordField.text &&
      pbRecordField.text?.includes(str)
  );
}

export function isZaakWithValidResultaat(
  validResultaten: string[],
  pbRecordFields: PBRecordField<string>[]
) {
  return pbRecordFields.some(
    (pbRecordField) =>
      pbRecordField.fieldName === 'RESULTAAT_ID' &&
      (!pbRecordField.text || validResultaten.includes(pbRecordField.text))
  );
}

export function isNotBestuurlijkGevoelig(
  pbRecordFields: PBRecordField<string>[]
) {
  return pbRecordFields.every(
    (pbRecordField) =>
      pbRecordField.fieldName !== 'BESTUURLIJK_GEVOELIG' ||
      !pbRecordField.text ||
      pbRecordField.text === 'Nee'
  );
}
