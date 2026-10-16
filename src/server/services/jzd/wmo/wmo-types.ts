import type {
  GenericDocument,
  ZaakAanvraagDetail,
} from '../../../../universal/types/App.types.ts';
import type { ProductSoortCode } from '../../zorgned/zorgned-types.ts';
import type { VoorzieningActiePropsFrontend } from '../jzd-types.ts';

export type WMOVoorzieningFrontend = ZaakAanvraagDetail &
  VoorzieningActiePropsFrontend & {
    dateDecision: string;
    dateDecisionFormatted: string;
    decision: string;
    documents: GenericDocument[];
    isActual: boolean; // Indicates if this item is designated Current or Previous
    itemTypeCode: ProductSoortCode;
    statusDate: string;
    statusDateFormatted: string;
    disclaimer?: string;
  };
