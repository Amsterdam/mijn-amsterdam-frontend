import { transformKenteken, translateValue } from './decos-helpers';
import { DecosFieldTransformerObject, WithKentekens } from './decos-types';

export const MA_DECISION_DEFAULT = 'Zie besluit';

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
  [CASE_TYP_FIELD_DECOS]: caseType,
  dfunction: decision,
  mark: identifier,
  processed: processed,
  date5: dateDecision,
  document_date: dateRequest,
  date6: dateStart,
  date7: dateEnd,
};

export const DECOS_EXCLUDE_CASES_WITH_INVALID_DFUNCTION = [
  'buiten behandeling',
  'geannuleerd',
  'geen aanvraag of dubbel',
];
// Cases with one of these subject1 values will not be included in the cases shown to the user. Payment is not yet processed or failed.

export const DECOS_EXCLUDE_CASES_WITH_PENDING_PAYMENT_CONFIRMATION_SUBJECT1 = [
  'wacht op online betaling',
  'wacht op ideal betaling',
];
// Cases with this dfunction value will not be included in the cases shown to the user.

export const DECOS_PENDING_REMOVAL_DFUNCTION = '*verwijder';
// Cases with this text11 value will not be included in the cases shown to the user. Payment is not yet processed or failed.
export const DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT11 = 'nogniet';
// Cases with this text12 value will not be included in the cases shown to the user. Payment is not yet processed or failed.
export const DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT12 =
  'wacht op online betaling';

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
