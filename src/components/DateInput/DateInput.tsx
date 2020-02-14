import React, { useState, useMemo } from 'react';
import styles from './DateInput.module.scss';
import { format, getDaysInMonth, parse } from 'date-fns';
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
  fromDate: Date;
  toDate: Date;
  className?: string;
}

export default function DateInput({
  onChange,
  value,
  fromDate,
  toDate,
  className,
}: ComponentProps) {
  const curDate = new Date(value);
  const [[yearSelected, monthSelected, daySelected], setDate] = useState([
    curDate.getFullYear(),
    curDate.getMonth(),
    curDate.getDate(),
  ]);

  const fromMonth = useMemo(() => {
    if (fromDate.getFullYear() === yearSelected) {
      return fromDate.getMonth();
    }
    return 0;
  }, [yearSelected, fromDate]);

  const toMonth = useMemo(() => {
    if (toDate.getFullYear() === yearSelected) {
      return toDate.getMonth();
    }
    return 11;
  }, [yearSelected, toDate]);

  const fromDay = useMemo(() => {
    if (
      fromDate.getFullYear() === yearSelected &&
      fromDate.getMonth() === monthSelected
    ) {
      return fromDate.getDate();
    }
    return 1;
  }, [yearSelected, fromDate, monthSelected]);

  const toDay = useMemo(() => {
    if (
      toDate.getFullYear() === yearSelected &&
      toDate.getMonth() === monthSelected
    ) {
      return toDate.getDate();
    }
    return getDaysInMonth(monthSelected);
  }, [yearSelected, toDate, monthSelected]);

  const hasNativeSupport = useMemo(() => {
    return isNativeDatePickerInputSupported();
  }, []);

  return (
    <>
      {hasNativeSupport && (
        <input
          className={classnames(styles.DateInput, className)}
          type="date"
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      )}
      {!hasNativeSupport && (
        <div className={classnames(styles.DateInputFallback, className)}>
          <select
            onChange={event => {
              const day = Number(event.target.value);
              setDate(([year, month]) => [year, month, day]);
            }}
            value={daySelected}
          >
            {range(fromDay, toDay).map(day => (
              <option key={day}>{day}</option>
            ))}
          </select>
          <select
            onChange={event => {
              const month = Number(event.target.value);
              setDate(([year, , day]) => [year, month, day]);
            }}
            value={monthSelected}
          >
            {range(fromMonth, toMonth).map(month => (
              <option key={month} value={month}>
                {getMonth(month)}
              </option>
            ))}
          </select>
          <select
            onChange={event => {
              const year = Number(event.target.value);
              setDate(([, month, day]) => [year, month, day]);
            }}
            value={yearSelected}
          >
            {range(fromDate.getFullYear(), toDate.getFullYear()).map(year => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
