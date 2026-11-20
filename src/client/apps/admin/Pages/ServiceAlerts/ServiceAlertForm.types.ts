import type { DateRange } from '@amsterdam/design-system-react';

import type {
  ServiceAlertInput,
  ServiceAlertsOverview,
} from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import type { serviceAlertFormFieldIds } from './ServiceAlertForm.constants.ts';

export type ServiceAlertSelectOption<Value extends string> = {
  value: Value;
  label: string;
};

export type ServiceAlertFormProps = {
  serviceAlert?: ServiceAlertsOverview[number];
  readOnly?: boolean;
};

export type ServiceAlertFormState = {
  title: string;
  body: string;
  type?: ServiceAlertInput['type'];
  displayLocation?: ServiceAlertInput['displayLocation'];
  themaId: string;
  dateRange: DateRange;
  timeStart: string;
  timeEnd: string;
};

export type SetServiceAlertFormValue = <
  Field extends keyof ServiceAlertFormState,
>(
  field: Field,
  value: ServiceAlertFormState[Field]
) => void;

export type ServiceAlertFormValues = ServiceAlertFormState & {
  links: ServiceAlertInput['links'];
  serviceAlert?: ServiceAlertsOverview[number];
};

export type ServiceAlertFormField = keyof typeof serviceAlertFormFieldIds;

export type ServiceAlertFormErrors = Partial<
  Record<ServiceAlertFormField, string>
>;

export type ServiceAlertFormResult =
  | { payload: ServiceAlertInput; errors: null }
  | { payload: null; errors: ServiceAlertFormErrors };
