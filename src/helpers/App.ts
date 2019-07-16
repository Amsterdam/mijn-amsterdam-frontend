import { KeyboardEvent, MouseEvent } from 'react';

function formatDate(
  date: Date,
  fmt: 'mm:ss' | 'DD MMMM YYYY' = 'DD MMMM YYYY'
) {
  var monthNames = [
    'Januari',
    'Februari',
    'Maart',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Augustus',
    'September',
    'Oktober',
    'November',
    'December',
  ];

  if (fmt === 'mm:ss') {
    const mins = date.getMinutes();
    const secs = date.getSeconds();

    return `${(mins + '').padStart(2, '0')}:${(secs + '').padStart(2, '0')}`;
  }

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return (
    (day + '').padStart(2, '0') + ' ' + monthNames[monthIndex] + ' ' + year
  );
}

export function defaultDateFormat(date: string | Date): string {
  return formatDate(new Date(date));
}

export function formattedTimeFromSeconds(seconds: number) {
  const secs = seconds % 60;
  const mins = (seconds - secs) / 60;
  const t = new Date(0, 0, 0, 0, mins, secs);

  return formatDate(t, 'mm:ss');
}

// https://github.com/Microsoft/TypeScript/issues/21826#issuecomment-479851685
export const entries = Object.entries as <T>(
  o: T
) => [Extract<keyof T, string>, T[keyof T]][];

// Repeating conditions for accessible keyboard event
export function withKeyPress<T>(fn: Function, keyName: string = 'enter') {
  return (event: KeyboardEvent<T> | MouseEvent<T>) => {
    if (!('key' in event) || event.key.toLowerCase() === keyName) {
      fn(event);
    }
  };
}

export function isProduction() {
  return process.env.REACT_APP_SENTRY_ENV === 'production';
}

export function isAcceptance() {
  return process.env.REACT_APP_SENTRY_ENV === 'acceptance';
}
