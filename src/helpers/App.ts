import { format } from 'date-fns';
import NL_LOCALE from 'date-fns/locale/nl';
import { DEFAULT_DATE_FORMAT } from 'App.constants';
import { KeyboardEvent, MouseEvent } from 'react';

export function dateFormat(datestr: string, fmt: string) {
  return format(datestr, fmt, { locale: NL_LOCALE });
}

export function defaultDateFormat(datestr: string) {
  return dateFormat(datestr, DEFAULT_DATE_FORMAT);
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
