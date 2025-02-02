import { DecosFieldTransformerObject, WithKentekens } from './config-and-types';
import { transformKenteken, translateValue } from './decos-helpers';

const status = 'status';
const identifier = 'identifier';
const processed = 'processed';
const dateDecision = 'dateDecision';

export const caseType = 'caseType';
export const dateRequest = 'dateRequest';
export const dateStart = 'dateStart';
export const dateEnd = 'dateEnd';
export const location = 'location';
export const timeStart = 'timeStart';
export const timeEnd = 'timeEnd';
export const destination = 'destination';
export const description = 'description';
export const decision = 'decision';

export const CASE_TYP_FIELD_DECOS = 'text45';

// Fields are selected per case initially but don't end up in the data we send to front end.
// These fields are fore example used to determine payment status.

export const SELECT_FIELDS_META = ['text11', 'text12', 'subject1'];
// The set of field transforms that applies to every case.
// { $api_attribute_name_source: $api_attribute_name_mijn_amsterdam }

export const SELECT_FIELDS_TRANSFORM_BASE: DecosFieldTransformerObject = {
  title: status,
  [CASE_TYP_FIELD_DECOS]: caseType,
  dfunction: decision,
  mark: identifier,
  processed: processed,
  date5: dateDecision,
  document_date: dateRequest,
  date6: dateStart,
  date7: dateEnd,
};

// 1 or multiple kenteken(s)
export const kentekens = {
  name: 'kentekens' as keyof WithKentekens, // TODO: Can this be typed stricter without casting?
  transform: transformKenteken,
};

export const transformDecision = (
  translationMapping: Parameters<typeof translateValue>[0]
) => ({
  name: 'decision' as const,
  transform: translateValue(translationMapping),
});
