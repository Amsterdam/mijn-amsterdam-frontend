import { KeyboardEvent, MouseEvent } from 'react';
import { matchPath } from 'react-router-dom';
import { BFF_API_BASE_URL } from '../../client/config/api';
import { PrivateRoutes } from '../config';

// https://github.com/Microsoft/TypeScript/issues/21826#issuecomment-479851685
export const entries = Object.entries as <T>(
  o: T
) => [Extract<keyof T, string>, T[keyof T]][];

export const keys = Object.keys as <T>(o: T) => (keyof T)[];

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
    (path) =>
      !!matchPath(pathname, {
        path,
        exact: true,
        strict: true,
      })
  );
}

export function isExternalUrl(url: string) {
  return !isInteralUrl(url);
}

export function relayApiUrl(path: string) {
  return `${BFF_API_BASE_URL}/relay${path}`;
}

export function range(a: number, b: number) {
  return Array.from(
    (function* (x, y) {
      while (x <= y) yield x++;
    })(a, b)
  );
}

export const omit = <T extends object, U extends keyof T>(
  obj: T,
  keys: U[]
): Omit<T, U> =>
  (Object.keys(obj) as U[]).reduce(
    (acc, curr) => (keys.includes(curr) ? acc : { ...acc, [curr]: obj[curr] }),
    {} as Omit<T, U>
  );

export function pick<T extends object>(source: T, keys: string[]) {
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => keys.includes(key))
  );
}

export function jsonCopy(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export function sortAlpha(
  key: string,
  direction: 'asc' | 'desc' = 'asc',
  casing?: 'lower' | 'upper'
) {
  return (a: Record<string, any>, b: Record<string, any>) => {
    const sortASC = direction === 'asc';
    let aValue = a[key];
    let bValue = b[key];

    switch (casing) {
      case 'upper':
        aValue = aValue.upper();
        bValue = bValue.upper();
        break;
      case 'lower':
        aValue = aValue.toLocaleLowerCase();
        bValue = bValue.toLocaleLowerCase();
        break;
    }

    if (aValue < bValue) {
      return sortASC ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortASC ? 1 : -1;
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
    return data.map((item) => deepOmitKeys(data, omitKeys));
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

export function recLookup(obj: any, path: string): any {
  if (!obj) {
    return;
  }
  const parts = path.split('.');
  if (parts.length === 1) {
    return obj[parts[0]];
  }
  return recLookup(obj[parts[0]], parts.slice(1).join('.'));
}

export function uniqueArray(arr: any[]) {
  return Array.from(new Set(arr));
}
