import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { format, getDaysInMonth, parseISO, isValid } from 'date-fns';
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
  className?: string;
  hasNativeSupport?: boolean;
}

export default function DateInput({
  onChange,
  value,
  className,
  hasNativeSupport = true,
}: ComponentProps) {
  const [[yearSelected, monthSelected, daySelected], setDateState] = useState([
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  ]);

  useEffect(() => {
    setDateState([value.getFullYear(), value.getMonth(), value.getDate()]);
  }, [value]);

  const setDate = useCallback(
    ([year, month, day]: [number, number, number]) => {
      setDateState([year, month, day]);
      const date = new Date(year, month, day);
      onChange(date);
    },
    [onChange, setDateState]
  );

  const daysInMonthSelected = useMemo(() => {
    return getDaysInMonth(new Date(yearSelected, monthSelected, daySelected));
  }, [yearSelected, monthSelected, daySelected]);

  let valueError = !isValid(value);
  let valueFormatted = '';

  if (!valueError) {
    valueFormatted = format(value, DATE_INPUT_FORMAT);
  }

  return (
    <>
      {hasNativeSupport && (
        <input
          className={classnames(
            styles.DateInput,
            className,
            valueError && styles.DateInputError
          )}
          type="date"
          value={valueFormatted}
          onChange={event => {
            if (event.target.value) {
              const parsed = parseISO(event.target.value);
              let dateValue = isValid(parsed) ? parsed : null;
              if (dateValue !== null) {
                onChange(dateValue);
              }
            }
          }}
        />
      )}
      {!hasNativeSupport && (
        <div className={classnames(styles.DateInputFallback, className)}>
          <select
            className={styles.DateInputFallbackSelect}
            onChange={event => {
              const day = Number(event.target.value);
              setDate([yearSelected, monthSelected, day]);
            }}
            value={daySelected}
          >
            {range(1, daysInMonthSelected).map(day => (
              <option key={day}>{day}</option>
            ))}
          </select>
          <select
            className={styles.DateInputFallbackSelect}
            onChange={event => {
              const month = Number(event.target.value);
              setDate([yearSelected, month, daySelected]);
            }}
            value={monthSelected}
          >
            {range(1, 12).map(month => (
              <option key={month} value={month}>
                {getMonth(month)}
              </option>
            ))}
          </select>
          <select
            className={styles.DateInputFallbackSelect}
            onChange={event => {
              const year = Number(event.target.value);
              setDate([year, monthSelected, daySelected]);
            }}
            value={yearSelected}
          >
            {range(
              Math.min(1900, yearSelected - 50),
              Math.min(yearSelected + 100, new Date().getFullYear())
            ).map(year => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
