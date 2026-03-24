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

export type MaApiPropAssigFN = (
  voorziening: ZorgnedAanvraagTransformed
) => boolean;
export type VoorzieningKey = Exclude<
  keyof ZorgnedAanvraagTransformed,
  'link' | 'documenten'
>;
export type VoorzieningValue = ZorgnedAanvraagTransformed[VoorzieningKey];

export type WmoAapiConfig = {
  assign: Partial<WithMaApiProps>;
  match: Partial<
    Record<
      VoorzieningKey,
      VoorzieningValue | VoorzieningValue[] | MaApiPropAssigFN
    >
  >;
};
