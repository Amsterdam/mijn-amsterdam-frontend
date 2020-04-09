import { ApiConfig, ApiName } from '../config';
import { KeyboardEvent, MouseEvent } from 'react';

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

export function omit(obj: Record<string, any>, fields: string[]) {
  const shallowCopy = {
    ...obj,
  };
  for (let i = 0; i < fields.length; i++) {
    const key = fields[i];
    delete shallowCopy[key];
  }
  return shallowCopy;
}
