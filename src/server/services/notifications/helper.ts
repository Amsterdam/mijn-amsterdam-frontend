type SnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
  : S;
export type Camelize<T extends object> = {
  [K in keyof T as SnakeToCamel<Extract<K, string>>]: T[K];
};

function camelizeKeys_<U extends Record<string, unknown>>(obj: U): Camelize<U> {
  const toCamel = (s: string) =>
    s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

  return Object.entries(obj).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [toCamel(k)]: v,
    }),
    {}
  ) as Camelize<U>;
}

export function camelizeKeys<T extends Record<string, unknown>>(
  input: T
): Camelize<T>;
export function camelizeKeys<T extends Record<string, unknown>>(
  input: T[]
): Camelize<T>[];
export function camelizeKeys<T extends Record<string, unknown>>(
  input: T | T[]
) {
  if (Array.isArray(input)) {
    return input.map((v) => camelizeKeys_(v));
  }
  return camelizeKeys_(input);
}
