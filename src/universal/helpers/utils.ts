import { differenceInCalendarDays } from 'date-fns';
import { KeyboardEvent, MouseEvent } from 'react';
import { matchPath } from 'react-router-dom';
import { PrivateRoutes, DAYS_KEEP_RECENT, IS_AP } from '../config';

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

export function isPrivateRoute(pathname: string) {
  return PrivateRoutes.some(
    path =>
      !!matchPath(pathname, {
        path,
        exact: true,
        strict: false,
      })
  );
}

export function isExternalUrl(url: string) {
  return !isInteralUrl(url);
}

export function directApiUrl(url: string) {
  return !IS_AP ? url.replace(/\/api\//, '/test-api/') : url;
}

export function range(a: number, b: number) {
  return Array.from(
    (function*(x, y) {
      while (x <= y) yield x++;
    })(a, b)
  );
}

export const omit = <T, U extends keyof T>(obj: T, keys: U[]): Omit<T, U> =>
  (Object.keys(obj) as U[]).reduce(
    (acc, curr) => (keys.includes(curr) ? acc : { ...acc, [curr]: obj[curr] }),
    {} as Omit<T, U>
  );

export function pick<T>(source: T, keys: string[]) {
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => keys.includes(key))
  );
}

export function jsonCopy(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export function sortAlpha(key: string) {
  return (a: Record<string, any>, b: Record<string, any>) => {
    if (a[key] < b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  };
}

// https://github.com/darkskyapp/string-hash
export function hash(str: string) {
  var hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return `${hash >>> 0}`;
}

// Recursively omit keys from objects. Important: Objects with all keys omitted will remain in the data empty.
export function deepOmitKeys(data: any, omitKeys: string[] = []): any {
  if (Array.isArray(data)) {
    return data.map(item => deepOmitKeys(data, omitKeys));
  } else if (data !== null && typeof data === 'object') {
    const rdata: Record<string, any> = omit(data, omitKeys);
    for (const [key, value] of Object.entries(rdata)) {
      if (Array.isArray(value)) {
        rdata[key] = rdata[key].map((item: any) =>
          deepOmitKeys(item, omitKeys)
        );
      } else if (typeof value === 'object') {
        rdata[key] = deepOmitKeys(value, omitKeys);
      }
    }
    return rdata;
  }
  return data;
}

/** Checks if an item returned from the api is considered recent */
export function isRecentCase(datePublished: string, compareDate: Date) {
  return (
    differenceInCalendarDays(compareDate, new Date(datePublished)) <
    DAYS_KEEP_RECENT
  );
}
