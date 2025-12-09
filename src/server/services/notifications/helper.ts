type SnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
  : S;
export type Camelize<T extends object> = {
  [K in keyof T as SnakeToCamel<Extract<K, string>>]: T[K];
};

export function camelizeKeys<T extends Record<string, unknown>>(
  input: T
): Camelize<T>;
export function camelizeKeys<T extends Record<string, unknown>>(
  input: T[]
): Camelize<T>[];
export function camelizeKeys<T extends Record<string, unknown>>(obj: T | T[]) {
  const camelize_ = <U extends Record<string, unknown>>(
    obj: U
  ): Camelize<U> => {
    const out: Record<string, unknown> = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      out[camelKey] = obj[key];
    }
    return out as Camelize<U>;
  };

  if (Array.isArray(obj)) {
    const a = obj.map((v) => camelize_(v));
    return a;
  }

  return camelize_(obj);
}
