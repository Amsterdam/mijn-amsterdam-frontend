import {
  type CaseTypeVergunningenOrPB,
  caseTypeVergunningen,
} from './config-and-types.ts';
import type { CaseTypeHorecaVergunningen } from '../horeca/decos-zaken.ts';
import { type CaseTypeParkeren } from '../parkeren/config-and-types.ts';

export type CaseType = Prettify<
  CaseTypeVergunningenOrPB | CaseTypeParkeren | CaseTypeHorecaVergunningen
>;

type NotificationCtaUrls = {
  verlengen?: string;
  aanvragen?: string;
  // Potentiele andere acties
  // vernieuwen: string;
  // opzeggen: string;
  // stopzetten: string;
  // wijzigen: string;
};

type VergunningAanvraagLinkByCaseType = Record<CaseType, NotificationCtaUrls>;

export const VERGUNNING_AANVRAAG_LINKS: Partial<VergunningAanvraagLinkByCaseType> =
  {
    [caseTypeVergunningen.RVVSloterweg]: {
      verlengen:
        'https://www.amsterdam.nl/vergunningen-ontheffingen/verlengen-ontheffing-sloterweg-laan/',
      aanvragen:
        'https://www.amsterdam.nl/vergunningen-ontheffingen/ontheffing-aanvragen-sloterweg-laan/',
    },
  } as const;
