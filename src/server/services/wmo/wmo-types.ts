import type {
  GenericDocument,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';
import type {
  ProductSoortCode,
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemsConfig,
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

export type WMOVoorzieningCompact = Pick<
  ZorgnedAanvraagTransformed,
  | 'id'
  | 'titel'
  | 'beschikkingNummer'
  | 'productIdentificatie'
  | 'beschiktProductIdentificatie'
  | 'datumBesluit'
  | 'datumBeginLevering'
  | 'datumEindeLevering'
  | 'datumOpdrachtLevering'
> & {
  productGroup: ZorgnedStatusLineItemsConfig['statusLineItems']['name'];
};
