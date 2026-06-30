import type {
  GenericDocument,
  ZaakAanvraagDetail,
} from '../../../../universal/types/App.types.ts';
import type { ProductSoortCode } from '../../zorgned/zorgned-types.ts';
import type { WithMaApiProps } from '../jzd-types.ts';

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
  // Which actions are available for this item, based on the JZD API configuration.
  maActies?: WithMaApiProps['maActies'];
  // Which URLs do these actions point to
  maActieUrls?: WithMaApiProps['maActieUrls'];
};
