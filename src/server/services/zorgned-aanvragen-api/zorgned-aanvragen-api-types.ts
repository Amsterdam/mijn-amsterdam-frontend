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

export type MaApiPropAssignFN<T, K, V> = (aanvraag: T, key: K) => V;
export type MaApiPropMatchFN<T> = (aanvraag: T) => boolean;
export type AanvraagKey<T> = Exclude<keyof T, 'link' | 'documenten'>;
export type AanvraagValue<T> = T[AanvraagKey<T>];

/**
 * The MatchConfig MUST return true for all defined keys.
 * There is no "OR" logic between keys, only "AND" logic. If you want to have "OR" logic, you can use a function for the value of a key, and implement your own logic there.
 */
type MatchConfig<T> = Partial<
  Record<
    AanvraagKey<T>,
    AanvraagValue<T> | AanvraagValue<T>[] | MaApiPropMatchFN<T>
  >
>;

export type AanvragenApiConfig<T extends object = ZorgnedAanvraagTransformed> =
  {
    assign: Prettify<Partial<WithMaApiPropsAssignments<T>>>;
    include: MatchConfig<T>;
    exclude?: MatchConfig<T>;
  };
