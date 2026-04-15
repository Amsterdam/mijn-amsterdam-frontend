import {
  type CaseTypeVergunningenOrPB,
  caseTypeVergunningen,
} from './config-and-types.ts';
import type { CaseTypeHorecaVergunningen } from '../horeca/decos-zaken.ts';
import { type CaseTypeParkeren } from '../parkeren/config-and-types.ts';

export type CaseType = Prettify<
  CaseTypeVergunningenOrPB | CaseTypeParkeren | CaseTypeHorecaVergunningen
>;
type VergunningAanvraagLinkByCaseType = Record<CaseType, string>;

export const VERGUNNING_AANVRAAG_LINKS: Partial<VergunningAanvraagLinkByCaseType> =
  {
    [caseTypeVergunningen.RVVSloterweg]:
      'https://www.amsterdam.nl/vergunningen-ontheffingen/verlengen-ontheffing-sloterweg-laan/',
  };
