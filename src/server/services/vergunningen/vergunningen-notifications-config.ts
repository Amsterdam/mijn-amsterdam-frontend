import {
  type CaseTypeVergunningenOrPB,
  caseTypeVergunningen,
} from './config-and-types.ts';
import type { CaseTypeHorecaVergunningen } from '../horeca/decos-zaken.ts';
import { type CaseTypeParkeren } from '../parkeren/config-and-types.ts';

export type CaseType = Prettify<
  CaseTypeVergunningenOrPB | CaseTypeParkeren | CaseTypeHorecaVergunningen
>;

type VergunningAanvraagLinksByCaseType = Record<CaseType, Links>;

type Links = { aanvragen: string; verlengen?: string };

const VERGUNNING_AANVRAAG_LINKS: Partial<VergunningAanvraagLinksByCaseType> = {
  [caseTypeVergunningen.RVVSloterweg]: {
    aanvragen:
      'https://www.amsterdam.nl/vergunningen-ontheffingen/ontheffing-aanvragen-sloterweg-laan/',
    verlengen:
      'https://www.amsterdam.nl/vergunningen-ontheffingen/verlengen-ontheffing-sloterweg-laan/',
  },
};

export function getVergunningAanvraagLinks(caseType: string): Links | null {
  const links =
    caseType && caseType in VERGUNNING_AANVRAAG_LINKS
      ? (VERGUNNING_AANVRAAG_LINKS[caseType as CaseType] ?? null)
      : null;
  return links;
}
