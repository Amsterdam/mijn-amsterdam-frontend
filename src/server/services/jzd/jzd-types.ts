import type {
  ZaakAanvraagDetail,
  GenericDocument,
} from '../../../universal/types/App.types.ts';
import type {
  ProductSoortCode,
  ZorgnedAanvraagTransformed,
} from '../zorgned/zorgned-types.ts';

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
 * The MatchConfig MUST return true for all defined keys.
 * There is no "OR" logic between keys, only "AND" logic. If you want to have "OR" logic, you can use a function for the value of a key, and implement your own logic there.
 */
type MatchConfig<T> = Partial<
  Record<
    VoorzieningKey<T>,
    VoorzieningValue<T> | VoorzieningValue<T>[] | MaApiPropMatchFN<T>
  >
>;

export type JzdApiConfig<T extends object = ZorgnedAanvraagTransformed> = {
  assign: Prettify<Partial<WithMaApiPropsAssignments<T>>>;
  include: MatchConfig<T>;
  exclude?: MatchConfig<T>;
};

export type JzdVoorzieningFrontend = ZaakAanvraagDetail & {
  dateDecision: string;
  dateDecisionFormatted: string;
  decision: string;
  documents: GenericDocument[];
  isActual: boolean; // Indicates if this item is designated Current or Previous
  itemTypeCode: ProductSoortCode | null;
  statusDate: string;
  statusDateFormatted: string;
  supplier: string | null; // Leverancier
  disclaimer?: string;
};
