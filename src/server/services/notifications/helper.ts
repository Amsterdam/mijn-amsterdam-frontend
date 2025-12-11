import { toCamel } from '../../../universal/helpers/text';

type SnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
  : S;
export type Camelize<T extends object> = {
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
