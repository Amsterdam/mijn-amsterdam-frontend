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
  verlengen?: {
    url: string;
    text: string;
  };
  aanvragen?: {
    url: string;
    text: string;
  };
  // Potentiële andere acties
  // vernieuwen?: { url: string; text: string };
  // opzeggen?: { url: string; text: string };
  // stopzetten?: { url: string; text: string };
  // wijzigen?: { url: string; text: string };
};

type VergunningAanvraagLinkByCaseType = Record<CaseType, NotificationCtaUrls>;

export const VERGUNNING_AANVRAAG_LINKS: Partial<VergunningAanvraagLinkByCaseType> =
  {
    [caseTypeVergunningen.RVVSloterweg]: {
      verlengen: {
        url: 'https://www.amsterdam.nl/vergunningen-ontheffingen/verlengen-ontheffing-sloterweg-laan/',
        text: 'vraag zo nodig een nieuwe vergunning aan.',
      },
      aanvragen: {
        url: 'https://www.amsterdam.nl/vergunningen-ontheffingen/ontheffing-aanvragen-sloterweg-laan/',
        text: 'vraag zo nodig een nieuwe vergunning aan.',
      },
    },
  } as const;
