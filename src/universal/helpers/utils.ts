import { differenceInMonths } from 'date-fns';

import { defaultDateFormat } from './date';
import { MONTHS_TO_KEEP_NOTIFICATIONS } from '../config/app';

// https://github.com/Microsoft/TypeScript/issues/21826#issuecomment-479851685
export const entries = Object.entries as <T>(
  o: T
) => [Extract<keyof T, string>, T[keyof T]][];

// export function entries<T>(obj: T extends object ? T : never) {
//   return Object.entries(obj) as Entries<T>;
// }

// export const entries = <T extends object>(obj: T) =>
//   Object.entries(obj) as Entries<T>;

export const keys = Object.keys as <T>(o: T) => (keyof T)[];

export function range(a: number, b: number) {
  return Array.from(
    (function* (x, y) {
      while (x <= y) yield x++;
    })(a, b)
  );
}

// This forces typescript to expand the intersection T<A | B> into T<A> | T<B>
export type OmitMapped<T, U extends keyof T> = T extends T ? Omit<T, U> : never;
export const omit = <T extends object, U extends keyof T>(
  obj: T,
  keys: U[]
): OmitMapped<T, U> =>
  (Object.keys(obj) as U[]).reduce(
    (acc, curr) => (keys.includes(curr) ? acc : { ...acc, [curr]: obj[curr] }),
    {} as OmitMapped<T, U>
  );

export function pick<T extends object>(source: T, keys: string[]) {
  return Object.fromEntries(
    entries(source).filter(([key]) => keys.includes(key))
  );
}

export function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object';
}

export function jsonCopy(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export function sortAlpha<T>(
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc',
  casing?: 'lower' | 'upper'
) {
  return (a: T, b: T) => {
    const sortASC = direction === 'asc';
    let aValue = a[key] as string;
    let bValue = b[key] as string;

    switch (casing) {
      case 'upper':
        aValue = aValue.toLocaleUpperCase();
        bValue = bValue.toLocaleUpperCase();
        break;
      case 'lower':
        aValue = aValue.toLocaleLowerCase();
        bValue = bValue.toLocaleLowerCase();
        break;
    }

    const compareResult = aValue.localeCompare(bValue);

    if (compareResult < 0) {
      return sortASC ? -1 : 1;
    }
    if (compareResult > 0) {
      return sortASC ? 1 : -1;
    }

    return 0;
  };
}

export function sortByNumber(key: string, direction: 'asc' | 'desc' = 'asc') {
  return (a: Record<string, any>, b: Record<string, any>) => {
    const sortASC = direction === 'asc';
    const aValue = a[key];
    const bValue = b[key];

    return sortASC ? aValue - bValue : bValue - aValue;
  };
}

// https://github.com/darkskyapp/string-hash
export function hash(str: string) {
  // eslint-disable-next-line no-magic-numbers
  let hash = 5381,
    i = str.length;
  const BITS = 33;
  while (i) {
    hash = (hash * BITS) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return `${hash >>> 0}`;
}

// Recursively omit keys from objects. Important: Objects with all keys omitted will remain in the data empty.
export function deepOmitKeys(data: any, omitKeys: string[] = []): any {
  if (Array.isArray(data)) {
    return data.map((item) => deepOmitKeys(item, omitKeys));
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

export function uniqueArray(arr: any[]) {
  return Array.from(new Set(arr));
}

export function isRecentNotification(
  datePublished: string,
  dateNow: Date = new Date()
): boolean {
  const diff = Math.abs(differenceInMonths(new Date(datePublished), dateNow));
  return diff < MONTHS_TO_KEEP_NOTIFICATIONS;
}
export function toDateFormatted(input: string | Date | number): string;
export function toDateFormatted(
  input: string | Date | number | null | undefined
): string | null;
// This is not a duplicate, this is the required implementation signature
export function toDateFormatted(
  input: string | Date | number | null | undefined
): string | null {
  if (input == null) {
    return null;
  }
  return defaultDateFormat(input);
}
