import { ApiConfig, ApiName, ApiUrls } from 'config/Api.constants';
import { DEFAULT_DATE_FORMAT } from 'config/App.constants';
import { format, parseISO } from 'date-fns';
import NL_LOCALE from 'date-fns/locale/nl';
import { KeyboardEvent, MouseEvent } from 'react';

export function dateFormat(datestr: string | Date | number, fmt: string) {
  if (!datestr) {
    return '';
  }
  const d = typeof datestr === 'string' ? parseISO(datestr) : datestr;
  return format(d, fmt, { locale: NL_LOCALE });
}

export function defaultDateFormat(datestr: string | Date | number) {
  return dateFormat(datestr, DEFAULT_DATE_FORMAT);
}

export function formattedTimeFromSeconds(seconds: number, format = 'mm:ss') {
  const secs = seconds % 60;
  const mins = (seconds - secs) / 60;

  const time = new Date(0, 0, 0, 0, mins, secs);
  const formattedTime = dateFormat(time, format);
  console.log('s.:', seconds, secs, mins, time, formattedTime, format);

  return formattedTime;
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
    } else if (c === d) {
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

export function getApiConfigValue(
  name: ApiName,
  param: keyof ApiConfig,
  defaultValue: any
) {
  const cfg = ApiConfig[name] && ApiConfig[name]![param];
  return typeof cfg !== 'undefined' ? cfg : defaultValue;
}

export function getApiUrl(name: ApiName) {
  return ApiUrls[name] || '';
}

/**
 * Sloppy determination if given url points to a page of the application
 * @param url string
 */
export function isInteralUrl(url: string) {
  return (
    url.match(/mijn\.(acc\.)?amsterdam.nl/) !== null ||
    url.startsWith('/') ||
    !url.startsWith('http')
  );
}

export function isExternalUrl(url: string) {
  return !isInteralUrl(url);
}

export function range(a: number, b: number) {
  return Array.from(
    (function*(x, y) {
      while (x <= y) yield x++;
    })(a, b)
  );
}

export function getMonth(index: number) {
  return [
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
  ][index];
}
