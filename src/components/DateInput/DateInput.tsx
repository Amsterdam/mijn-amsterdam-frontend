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
  className?: string;
  hasNativeSupport?: boolean;
}

function parseDateParts(value: string) {
  return value.split('-').map((p, i) => Number(p));
}

export default function DateInput({
  onChange,
  value,
  className,
  hasNativeSupport = true,
}: ComponentProps) {
  const valueDateFormatted = format(value, DATE_INPUT_FORMAT);

  const [[yearSelected, monthSelected, daySelected], setDateState] = useState(
    parseDateParts(valueDateFormatted)
  );

  const initalValue = useMemo(() => {
    return value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDate = useCallback(
    ([year, month, day]: [number, number, number]) => {
      setDateState([year, month, day]);
      onChange(new Date(year, month, day));
    },
    [onChange, setDateState]
  );

  const daysInMonthSelected = useMemo(() => {
    return getDaysInMonth(new Date(yearSelected, monthSelected, daySelected));
  }, [yearSelected, monthSelected, daySelected]);

  return (
    <>
      {hasNativeSupport && (
        <input
          className={classnames(styles.DateInput, className)}
          type="date"
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
                {getMonth(month - 1)}
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
