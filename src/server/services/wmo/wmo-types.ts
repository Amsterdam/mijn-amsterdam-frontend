import type {
  GenericDocument,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';
import type {
  ProductSoortCode,
  ZorgnedAanvraagTransformed,
} from '../zorgned/zorgned-types.ts';

export type WMOVoorzieningFrontend = ZaakAanvraagDetail & {
  dateDecision: string;
  dateDecisionFormatted: string;
  decision: string;
  documents: GenericDocument[];
  isActual: boolean; // Indicates if this item is designated Current or Previous
  itemTypeCode: ProductSoortCode;
  statusDate: string;
  statusDateFormatted: string;
  supplier: string | null; // Leverancier
  disclaimer?: string;
};

export type WithMaApiProps = {
  maCategorie: string[];
  maActies: ('stopzetten' | 'reparatieverzoek')[];
  maProductgroep: string[];
};
export type ZorgnedAanvraagTransformedWithMaApiProps =
  ZorgnedAanvraagTransformed & Partial<WithMaApiProps>;

export type MaApiPropAssigFN<T> = (voorziening: T) => boolean;
export type VoorzieningKey<T> = Exclude<keyof T, 'link' | 'documenten'>;
export type VoorzieningValue<T> = T[VoorzieningKey<T>];

export type WmoAapiConfig<T extends object = ZorgnedAanvraagTransformed> = {
  assign: Partial<WithMaApiProps>;
  match: Partial<
    Record<
      VoorzieningKey<T>,
      VoorzieningValue<T> | VoorzieningValue<T>[] | MaApiPropAssigFN<T>
    >
  >;
};
