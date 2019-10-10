import { DEFAULT_DATE_FORMAT } from 'App.constants';
import { format, parseISO } from 'date-fns';
import NL_LOCALE from 'date-fns/locale/nl';
import { KeyboardEvent, MouseEvent } from 'react';

export function dateFormat(datestr: string | Date | number, fmt: string) {
  const d = typeof datestr === 'string' ? parseISO(datestr) : datestr;
  return format(d, fmt, { locale: NL_LOCALE });
}

export function defaultDateFormat(datestr: string | Date | number) {
  return dateFormat(datestr, DEFAULT_DATE_FORMAT);
}

export function formattedTimeFromSeconds(seconds: number) {
  const secs = seconds % 60;
  const mins = (seconds - secs) / 60;
  const time = new Date(0, 0, 0, 0, mins, secs);

  return dateFormat(time, 'mm:ss');
}

export function isDateInPast(date: string | Date, dateNow: string | Date) {
  return new Date(date).getTime() <= new Date(dateNow).getTime();
}

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function dateSort(sortKey: string, direction: 'asc' | 'desc' = 'asc') {
  return (a: any, b: any) => {
    const c = new Date(a[sortKey]).getTime();
    const d = new Date(b[sortKey]).getTime();

    const s = direction === 'asc' ? c < d : d < c;

    if (s) {
      return -1;
    } else if (c == d) {
      return 0;
    } else {
      return 1;
    }
  };
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
  return process.env.REACT_APP_BUILD_ENV === 'production';
}

export function isAcceptance() {
  return process.env.REACT_APP_BUILD_ENV === 'acceptance';
}
