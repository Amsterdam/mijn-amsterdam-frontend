import React, { useCallback, useMemo, useState } from 'react';
import { format, getDaysInMonth } from 'date-fns';
import { getMonth, range } from 'helpers/App';

import classnames from 'classnames';
import styles from './DateInput.module.scss';

const DATE_INPUT_FORMAT = 'yyyy-MM-dd';

export function isNativeDatePickerInputSupported() {
  const input = document.createElement('input');
  const value = 'a';
  input.setAttribute('type', 'date');
  input.setAttribute('value', value);
  return input.value !== value;
}

export interface ComponentProps {
  onChange: (date: Date) => void;
  value: Date;
  minDate: Date;
  maxDate: Date;
  className?: string;
}

function parseDateParts(value: string) {
  return value.split('-').map((p, i) => Number(p) - (i === 1 ? 1 : 0));
}

function checkValiDateFormat(value: string) {
  const parts = value.split('-');
  return (
    parts.length === 3 &&
    parts[0].length === 4 &&
    parts[1].length === 2 &&
    parts[2].length === 2 &&
    parseInt(parts[1], 10) >= 1 &&
    parseInt(parts[1], 10) <= 12 &&
    parseInt(parts[2], 10) >= 1 &&
    parseInt(parts[2], 10) <= 31
  );
}

export default function DateInput({
  onChange,
  value,
  minDate,
  maxDate,
  className,
}: ComponentProps) {
  const valueDateFormatted = format(value, DATE_INPUT_FORMAT);
  const minDateFormatted = format(minDate, DATE_INPUT_FORMAT);
  const maxDateFormatted = format(maxDate, DATE_INPUT_FORMAT);

  const [[yearSelected, monthSelected, daySelected], setDateState] = useState(
    parseDateParts(valueDateFormatted)
  );

  const initalValue = useMemo(() => {
    return value;
  }, []);

  const minDateParts = useMemo(() => {
    return parseDateParts(minDateFormatted);
  }, [minDateFormatted]);

  const maxDateParts = useMemo(() => {
    return parseDateParts(maxDateFormatted);
  }, [maxDateFormatted]);

  const setDate = useCallback(
    (date: [number, number, number]) => {
      setDateState(date);
      onChange(new Date(date.join('-')));
    },
    [onChange, setDateState]
  );

  const fromMonth = useMemo(() => {
    if (minDateParts[0] === yearSelected) {
      return minDateParts[1];
    }
    return 0;
  }, [yearSelected, minDateParts]);

  const toMonth = useMemo(() => {
    if (maxDateParts[0] === yearSelected) {
      return maxDateParts[1];
    }
    return 11;
  }, [yearSelected, maxDateParts]);

  const fromDay = useMemo(() => {
    if (minDateParts[0] === yearSelected && minDateParts[1] === monthSelected) {
      return minDateParts[2];
    }
    return 1;
  }, [yearSelected, minDateParts, monthSelected]);

  const toDay = useMemo(() => {
    if (maxDateParts[0] === yearSelected && maxDateParts[1] === monthSelected) {
      return maxDateParts[2];
    }
    return getDaysInMonth(monthSelected);
  }, [yearSelected, maxDateParts, monthSelected]);

  const daysInMonthSelected = useMemo(() => {
    return getDaysInMonth(new Date(yearSelected, monthSelected, daySelected));
  }, [yearSelected, monthSelected, daySelected]);

  const hasNativeSupport = useMemo(() => {
    return isNativeDatePickerInputSupported();
  }, []);

  return (
    <>
      {hasNativeSupport && (
        <input
          className={classnames(styles.DateInput, className)}
          type="date"
          min={minDateFormatted}
          max={maxDateFormatted}
          value={valueDateFormatted}
          onChange={event => {
            onChange(
              event.target.value ? new Date(event.target.value) : initalValue
            );
          }}
        />
      )}
      {!hasNativeSupport && (
        <div className={classnames(styles.DateInputFallback, className)}>
          <select
            onChange={event => {
              const day = Number(event.target.value);
              setDate([yearSelected, monthSelected, day]);
            }}
            value={daySelected}
          >
            {range(1, daysInMonthSelected).map(day => (
              <option disabled={day < fromDay || day > toDay} key={day}>
                {day}
              </option>
            ))}
          </select>
          <select
            onChange={event => {
              const month = Number(event.target.value);
              setDate([yearSelected, month, daySelected]);
            }}
            value={monthSelected}
          >
            {range(0, 11).map(month => (
              <option
                disabled={month < fromMonth || month > toMonth}
                key={month}
                value={month}
              >
                {getMonth(month)}
              </option>
            ))}
          </select>
          <select
            onChange={event => {
              const year = Number(event.target.value);
              setDate([year, monthSelected, daySelected]);
            }}
            value={yearSelected}
          >
            {range(minDateParts[0], maxDateParts[0]).map(year => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
