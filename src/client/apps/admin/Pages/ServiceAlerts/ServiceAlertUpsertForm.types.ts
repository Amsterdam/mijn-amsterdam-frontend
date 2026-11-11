import type { DateRange } from '@amsterdam/design-system-react';

import type {
  ServiceAlertInput,
  ServiceAlertsOverview,
} from '../../../../../server/services/service-alerts/service-alerts.types.ts';

export type ServiceAlertSelectOption<Value extends string> = {
  value: Value;
  label: string;
};

export type ServiceAlertUpsertFormProps = {
  serviceAlert?: ServiceAlertsOverview[number];
  readOnly?: boolean;
};

export type ServiceAlertUpsertFormValues = {
  formData: FormData;
  dateRange: DateRange;
  timeStart: string;
  timeEnd: string;
  type: ServiceAlertInput['type'];
  serviceAlert?: ServiceAlertsOverview[number];
};

export type ServiceAlertUpsertFormResult =
  | { payload: ServiceAlertInput; validationMessage: null }
  | { payload: null; validationMessage: string };
