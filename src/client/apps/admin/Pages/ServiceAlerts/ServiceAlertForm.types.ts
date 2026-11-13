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

export type ServiceAlertFormValues = {
  formData: FormData;
  dateRange: DateRange;
  timeStart: string;
  timeEnd: string;
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
