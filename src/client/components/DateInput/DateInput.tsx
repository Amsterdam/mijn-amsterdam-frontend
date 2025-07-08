import { useCallback, useEffect, useMemo, useState } from 'react';

import classnames from 'classnames';
import { format, getDaysInMonth, isValid, parseISO } from 'date-fns';

import styles from './DateInput.module.scss';
import { getMonth } from '../../../universal/helpers/date.ts';
import { range } from '../../../universal/helpers/utils.ts';

const DATE_INPUT_FORMAT = 'yyyy-MM-dd';

const MINIMUM_YEAR = 1900;
const YEARS_BEFORE_SELECTED = 50;
const YEARS_AFTER_SELECTED = 100;
const currentYear = new Date().getFullYear();

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

  const valueError = !isValid(value);
  let valueFormatted = '';

  if (!valueError) {
    valueFormatted = format(value, DATE_INPUT_FORMAT);
  }

  const MONTHS_IN_YEAR_INDEX = 11;
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
          onChange={(event) => {
            if (event.target.value) {
              const parsed = parseISO(event.target.value);
              const dateValue = isValid(parsed) ? parsed : null;
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
            onChange={(event) => {
              const day = Number(event.target.value);
              setDate([yearSelected, monthSelected, day]);
            }}
            value={daySelected}
          >
            {range(1, daysInMonthSelected).map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
          <select
            className={styles.DateInputFallbackSelect}
            onChange={(event) => {
              const month = Number(event.target.value);
              setDate([yearSelected, month, daySelected]);
            }}
            value={monthSelected}
          >
            {range(0, MONTHS_IN_YEAR_INDEX).map((month) => (
              <option key={month} value={month}>
                {getMonth(month)}
              </option>
            ))}
          </select>
          <select
            className={styles.DateInputFallbackSelect}
            onChange={(event) => {
              const year = Number(event.target.value);
              setDate([year, monthSelected, daySelected]);
            }}
            value={yearSelected}
          >
            {range(
              Math.max(MINIMUM_YEAR, yearSelected - YEARS_BEFORE_SELECTED),
              Math.min(yearSelected + YEARS_AFTER_SELECTED, currentYear)
            ).map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
