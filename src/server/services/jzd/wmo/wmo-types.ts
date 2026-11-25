import type {
  GenericDocument,
  ZaakAanvraagDetail,
} from '../../../../universal/types/App.types.ts';
import type {
  LeveringsVormTransformed,
  LeveringsVormUitgeschreven,
  ProductSoortCode,
} from '../../zorgned/zorgned-types.ts';
import type { VoorzieningActiePropsFrontend } from '../jzd-types.ts';
import type {
  STATUS_BESLUIT_GENOMEN,
  STATUS_EINDE_RECHT,
  STATUS_IN_BEHANDELING,
  STATUS_MEER_INFORMATIE_NODIG,
  STATUS_MEER_INFORMATIE_ONTVANGEN,
  STATUS_ONTVANGEN,
} from './wmo-config.ts';

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
    leveringsvorm: LeveringsVormTransformed;
    leveringsvormUitgeschreven: LeveringsVormUitgeschreven;
  };

export type DisplayStatus =
  | typeof STATUS_ONTVANGEN
  | typeof STATUS_IN_BEHANDELING
  | typeof STATUS_MEER_INFORMATIE_NODIG
  | typeof STATUS_MEER_INFORMATIE_ONTVANGEN
  | typeof STATUS_BESLUIT_GENOMEN
  | typeof STATUS_EINDE_RECHT;
