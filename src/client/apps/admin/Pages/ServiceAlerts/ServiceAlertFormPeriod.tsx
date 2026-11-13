import {
  DatePicker,
  type DateRange,
  Field,
  FieldSet,
  Label,
  Row,
  TimeInput,
} from '@amsterdam/design-system-react';

import { serviceAlertFormFieldIds } from './ServiceAlertForm.constants.ts';
import type { ServiceAlertFormErrors } from './ServiceAlertForm.types.ts';
import {
  FieldError,
  getErrorId,
  getFieldProps,
} from './ServiceAlertFormFieldError.tsx';

type ServiceAlertFormPeriodProps = {
  errors: ServiceAlertFormErrors;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  timeStart: string;
  setTimeStart: (time: string) => void;
  timeEnd: string;
  setTimeEnd: (time: string) => void;
};

export function ServiceAlertFormPeriod({
  errors,
  dateRange,
  setDateRange,
  timeStart,
  setTimeStart,
  timeEnd,
  setTimeEnd,
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
        value={dateRange}
        onChange={setDateRange}
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
            name="timeStart"
            value={timeStart}
            onChange={(event) => setTimeStart(event.currentTarget.value)}
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
            name="timeEnd"
            value={timeEnd}
            onChange={(event) => setTimeEnd(event.currentTarget.value)}
            aria-required="true"
          />
        </Field>
      </Row>
    </FieldSet>
  );
}
