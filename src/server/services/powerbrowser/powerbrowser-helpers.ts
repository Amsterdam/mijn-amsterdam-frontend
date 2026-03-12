import type { PBRecordField } from './powerbrowser-types.ts';

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
