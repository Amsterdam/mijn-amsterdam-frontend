import {
  DatePicker,
  Field,
  FieldSet,
  Label,
  Row,
  TimeInput,
} from '@amsterdam/design-system-react';

import { serviceAlertFormFieldIds } from './ServiceAlertForm.constants.ts';
import type {
  ServiceAlertFormErrors,
  ServiceAlertFormState,
  SetServiceAlertFormValue,
} from './ServiceAlertForm.types.ts';
import {
  FieldError,
  getErrorId,
  getFieldProps,
} from './ServiceAlertFormFieldError.tsx';

type ServiceAlertFormPeriodProps = {
  errors: ServiceAlertFormErrors;
  values: Pick<ServiceAlertFormState, 'dateRange' | 'timeStart' | 'timeEnd'>;
  setValue: SetServiceAlertFormValue;
};

export function ServiceAlertFormPeriod({
  errors,
  values,
  setValue,
}: ServiceAlertFormPeriodProps) {
  return (
    <FieldSet
      id={serviceAlertFormFieldIds.period}
      legend="Periode"
      inFieldSet
      invalid={!!errors.period}
      aria-describedby={errors.period ? getErrorId('period') : undefined}
    >
      <FieldError errors={errors} field="period" />
      <DatePicker
        mode="range"
        value={values.dateRange}
        onChange={(dateRange) => setValue('dateRange', dateRange)}
        nextMonthButtonLabel="Volgende maand"
        nextYearButtonLabel="Volgend jaar"
        previousMonthButtonLabel="Vorige maand"
        previousYearButtonLabel="Vorig jaar"
        rangeStartAccessibleName="startdatum"
        rangeEndAccessibleName="einddatum"
      />
      <Row wrap>
        <Field invalid={!!errors.timeStart}>
          <Label htmlFor={serviceAlertFormFieldIds.timeStart} inFieldSet>
            Starttijd
          </Label>
          <FieldError errors={errors} field="timeStart" />
          <TimeInput
            {...getFieldProps(errors, 'timeStart')}
            value={values.timeStart}
            onChange={(event) =>
              setValue('timeStart', event.currentTarget.value)
            }
            aria-required="true"
          />
        </Field>
        <Field invalid={!!errors.timeEnd}>
          <Label htmlFor={serviceAlertFormFieldIds.timeEnd} inFieldSet>
            Eindtijd
          </Label>
          <FieldError errors={errors} field="timeEnd" />
          <TimeInput
            {...getFieldProps(errors, 'timeEnd')}
            value={values.timeEnd}
            onChange={(event) => setValue('timeEnd', event.currentTarget.value)}
            aria-required="true"
          />
        </Field>
      </Row>
    </FieldSet>
  );
}
