import {
  type CaseTypeVergunningenOrPB,
  caseTypeVergunningen,
} from './config-and-types.ts';
import type { CaseTypeHorecaVergunningen } from '../horeca/decos-zaken.ts';
import {
  caseTypeParkeren,
  type CaseTypeParkeren,
} from '../parkeren/config-and-types.ts';

export type CaseType = Prettify<
  CaseTypeVergunningenOrPB | CaseTypeParkeren | CaseTypeHorecaVergunningen
>;

type VergunningCTALinksByCaseType = Record<CaseType, Links>;

type Links = { aanvragen?: string; verlengen?: string; meerinfo?: string };

const VERGUNNING_CTA_LINKS: Partial<VergunningCTALinksByCaseType> = {
  [caseTypeVergunningen.RVVSloterweg]: {
    aanvragen:
      'https://www.amsterdam.nl/vergunningen-ontheffingen/ontheffing-aanvragen-sloterweg-laan/',
    verlengen:
      'https://www.amsterdam.nl/vergunningen-ontheffingen/verlengen-ontheffing-sloterweg-laan/',
  },
  [caseTypeParkeren.GPK]: {
    meerinfo:
      'https://www.amsterdam.nl/parkeren/parkeren-gehandicapten/europese-gehandicaptenparkeerkaart/gehandicaptenparkeerkaart-aanvragen/#zo-lang-duurt-het',
  },
};

export function getVergunningCTALinks(caseType: string): Links | null {
  const links =
    caseType && caseType in VERGUNNING_CTA_LINKS
      ? (VERGUNNING_CTA_LINKS[caseType as CaseType] ?? null)
      : null;
  return links;
}
