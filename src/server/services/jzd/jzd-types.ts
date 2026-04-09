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

export type JzdApiConfig<T extends object = ZorgnedAanvraagTransformed> = {
  assign: Prettify<Partial<WithMaApiPropsAssignments<T>>>;
  match: Partial<
    Record<
      VoorzieningKey<T>,
      VoorzieningValue<T> | VoorzieningValue<T>[] | MaApiPropMatchFN<T>
    >
  >;
};
