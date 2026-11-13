import { ErrorMessage } from '@amsterdam/design-system-react';

import { serviceAlertFormFieldIds } from './ServiceAlertForm.constants.ts';
import type {
  ServiceAlertFormErrors,
  ServiceAlertFormField,
} from './ServiceAlertForm.types.ts';

export function getErrorId(field: ServiceAlertFormField) {
  return `${serviceAlertFormFieldIds[field]}-error`;
}

export function getFieldProps(
  errors: ServiceAlertFormErrors,
  field: ServiceAlertFormField
) {
  return {
    id: serviceAlertFormFieldIds[field],
    invalid: !!errors[field],
  };
}

export function FieldError({
  errors,
  field,
}: {
  errors: ServiceAlertFormErrors;
  field: ServiceAlertFormField;
}) {
  const message = errors[field];
  return message ? (
    <ErrorMessage id={getErrorId(field)}>{message}</ErrorMessage>
  ) : null;
}
