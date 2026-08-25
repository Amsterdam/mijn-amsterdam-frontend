import type { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types.ts';

export type WithMaApiProps = {
  maCategorie: string[];
  maActies: string[];
  maProductgroep: string;
  maActieUrls: Record<string, string>;
};
export type WithMaApiPropsAssignments<T> = {
  [Key in keyof WithMaApiProps]:
    | WithMaApiProps[Key]
    | MaApiPropAssignFN<T, Key, WithMaApiProps[Key]>;
};
export type ZorgnedAanvraagTransformedWithMaApiProps =
  ZorgnedAanvraagTransformed & Partial<WithMaApiProps>;

export type MaApiPropAssignFN<T, K, V> = (voorziening: T, key: K) => V;
export type MaApiPropMatchFN<T> = (voorziening: T) => boolean;
export type VoorzieningKey<T> = Exclude<keyof T, 'link' | 'documenten'>;
export type VoorzieningValue<T> = T[VoorzieningKey<T>];

/**
 * The MatchConfig MUST return true for all defined keys when using include.every or exclude.every.
 * The MatchConfig MUST return true for at least one defined key when using include.some or exclude.some.
 */
export type MatchConfig<T> = Partial<
  Record<
    VoorzieningKey<T>,
    VoorzieningValue<T> | VoorzieningValue<T>[] | MaApiPropMatchFN<T>
  >
>;

export type JzdApiConfig<T extends object = ZorgnedAanvraagTransformed> = {
  assign: Prettify<Partial<WithMaApiPropsAssignments<T>>>;
  // Includes if every match config returns true. e.g. assert(foo === 'bar' && baz === 'qux')
  'include.every'?: MatchConfig<T>;
  // Includes if some match config returns true. e.g. assert(foo === 'bar' || baz === 'qux')
  'include.some'?: MatchConfig<T>;
  // Excludes if every match config returns true. e.g. assert(foo === 'bar' && baz === 'qux')
  'exclude.every'?: MatchConfig<T>;
  // Excludes if some match config returns true. e.g. assert(foo === 'bar' || baz === 'qux')
  'exclude.some'?: MatchConfig<T>;
};
