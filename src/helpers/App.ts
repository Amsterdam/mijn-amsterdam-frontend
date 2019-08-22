import { KeyboardEvent, MouseEvent } from 'react';

function formatDate(
  date: Date,
  fmt: 'mm:ss' | 'DD MMMM YYYY' = 'DD MMMM YYYY'
) {
  const monthNames = [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december',
  ];

  if (fmt === 'mm:ss') {
    const mins = date.getUTCMinutes();
    const secs = date.getUTCSeconds();

    return `${(mins + '').padStart(2, '0')}:${(secs + '').padStart(2, '0')}`;
  }

  const day = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const year = date.getUTCFullYear();

  return (
    (day + '').padStart(2, '0') + ' ' + monthNames[monthIndex] + ' ' + year
  );
}

export function defaultDateFormat(
  date: any,
  defaultContent: string = ''
): string {
  return date ? formatDate(new Date(date)) : defaultContent;
}

export function formattedTimeFromSeconds(seconds: number) {
  const secs = seconds % 60;
  const mins = (seconds - secs) / 60;
  const t = new Date(0, 0, 0, 0, mins, secs);

  return formatDate(t, 'mm:ss');
}

export function isDateInPast(date: string | Date) {
  return new Date(date).getTime() < new Date().getTime();
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
