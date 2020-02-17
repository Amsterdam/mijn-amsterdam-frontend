import React, { useState, useMemo, useCallback } from 'react';
import styles from './DateInput.module.scss';
import { getDaysInMonth, format } from 'date-fns';
import { range, getMonth } from 'helpers/App';
import classnames from 'classnames';

export function isNativeDatePickerInputSupported() {
  const input = document.createElement('input');
  const value = 'a';
  input.setAttribute('type', 'date');
  input.setAttribute('value', value);
  return input.value !== value;
}

export interface ComponentProps {
  onChange: (date: string) => void;
  value: string;
  minDate: Date;
  maxDate: Date;
  className?: string;
}

export default function DateInput({
  onChange,
  value,
  minDate,
  maxDate,
  className,
}: ComponentProps) {
  const curDate = new Date(value);
  const [[yearSelected, monthSelected, daySelected], setDateState] = useState([
    curDate.getFullYear(),
    curDate.getMonth(),
    curDate.getDate(),
  ]);

  const setDate = useCallback(
    (date: [number, number, number]) => {
      setDateState(date);
      onChange(date.join('-'));
    },
    [onChange, setDateState]
  );

  const fromMonth = useMemo(() => {
    if (minDate.getFullYear() === yearSelected) {
      return minDate.getMonth();
    }
    return 0;
  }, [yearSelected, minDate]);

  const toMonth = useMemo(() => {
    if (maxDate.getFullYear() === yearSelected) {
      return maxDate.getMonth();
    }
    return 11;
  }, [yearSelected, maxDate]);

  const fromDay = useMemo(() => {
    if (
      minDate.getFullYear() === yearSelected &&
      minDate.getMonth() === monthSelected
    ) {
      return minDate.getDate();
    }
    return 1;
  }, [yearSelected, minDate, monthSelected]);

  const toDay = useMemo(() => {
    if (
      maxDate.getFullYear() === yearSelected &&
      maxDate.getMonth() === monthSelected
    ) {
      return maxDate.getDate();
    }
    return getDaysInMonth(monthSelected);
  }, [yearSelected, maxDate, monthSelected]);

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
          min={format(minDate, 'yyyy-MM-dd')}
          max={format(maxDate, 'yyyy-MM-dd')}
          value={value}
          onChange={event => onChange(event.target.value)}
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
            {range(minDate.getFullYear(), maxDate.getFullYear()).map(year => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
