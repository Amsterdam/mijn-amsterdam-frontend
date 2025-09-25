import type { PBRecordField } from './powerbrowser-types';

export function getCaseTypeFromFMT_CAPTION(
  pbRecordField: PBRecordField<string>,
  caseType: string
) {
  return (
    pbRecordField.fieldName === 'FMT_CAPTION' &&
    !!pbRecordField.text &&
    pbRecordField.text?.includes(caseType)
  );
}
