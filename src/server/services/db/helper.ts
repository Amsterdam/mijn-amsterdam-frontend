import { toCamel } from '../../../universal/helpers/text';

export type SnakeToCamel<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
    : S;
type Camelize<T extends object> = {
  [K in keyof T as SnakeToCamel<Extract<K, string>>]: T[K];
};

export function camelizeKeys<T extends Record<string, unknown>>(obj: T) {
  return Object.entries(obj).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [toCamel(k)]: v,
    }),
    {}
  ) as Camelize<T>;
}

export function deepCamelizeKeys<T extends Record<string, any>>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCamelizeKeys(item)) as unknown as T;
  } else if (obj && typeof obj === 'object') {
    const camelizedObj = camelizeKeys(obj);
    return Object.entries(camelizedObj).reduce((acc, [key, value]) => {
      acc[key] = deepCamelizeKeys(value);
      return acc;
    }, {} as Record<string, any>) as T;
  }
  return obj;
}