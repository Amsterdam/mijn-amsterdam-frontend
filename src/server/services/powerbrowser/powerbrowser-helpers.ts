import type { PBRecordField } from './powerbrowser-types';

export function hasCaseTypeInFMT_CAPTION(
  pbRecordField: PBRecordField<string>,
  caseType: string
) {
  return (
    pbRecordField.fieldName === 'FMT_CAPTION' &&
    !!pbRecordField.text &&
    pbRecordField.text?.includes(caseType)
  );
}

export function hasStringInZAAKPRODUCT_ID(
  pbRecordField: PBRecordField<string>,
  str: string
) {
  return (
    pbRecordField.fieldName === 'ZAAKPRODUCT_ID' &&
    !!pbRecordField.text &&
    pbRecordField.text?.includes(str)
  );
}

export function hasStringInZAAK_SUBPRODUCT_ID(
  pbRecordField: PBRecordField<string>,
  str: string
) {
  return (
    pbRecordField.fieldName === 'ZAAK_SUBPRODUCT_ID' &&
    !!pbRecordField.text &&
    pbRecordField.text?.includes(str)
  );
}

export function isZaakWithValidResultaat(
  pbRecordField: PBRecordField<string>,
  validResultaten: string[]
) {
  return (
    pbRecordField.fieldName === 'RESULTAAT_ID' &&
    !!pbRecordField.text &&
    validResultaten.includes(pbRecordField.text)
  );
}

export function isNotBestuurlijkGevoelig(pbRecordField: PBRecordField<string>) {
  return (
    pbRecordField.fieldName !== 'BESTUURLIJK_GEVOELIG' ||
    !pbRecordField.fieldValue ||
    pbRecordField.fieldValue === 'F'
  );
}
