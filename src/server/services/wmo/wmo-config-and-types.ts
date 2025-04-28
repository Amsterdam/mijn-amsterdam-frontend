import { parseISO } from 'date-fns';

import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types';
import {
  BeschikkingsResultaat,
  ProductSoortCode,
} from '../zorgned/zorgned-types';

export const SINGLE_DOC_TITLE_BESLUIT = 'Brief';

export const ZORGNED_JZD_REGELING_IDENTIFICATIE = 'wmo';
export const BESCHIKTPRODUCT_RESULTAAT: BeschikkingsResultaat[] = [
  'toegewezen',
];
export const DATE_END_NOT_OLDER_THAN = '2018-01-01';
export const MINIMUM_REQUEST_DATE_FOR_DOCUMENTS = parseISO('2022-01-01'); // After this date documents are WCAG proof.

export interface WMOVoorzieningFrontend extends ZaakDetail {
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
}

export const DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH = 'Verzoek:'; // Documents starting with this token correspond to the 'meer informatie' step.
export const DOCUMENT_TITLE_BESLUIT_STARTS_WITH = 'Besluit:'; // Documents starting with this token correspond to the 'besluit' step.
export const DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE =
  'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/OJZDUploadBijlagen.aspx';
export const DOCUMENT_PGB_BESLUIT =
  'https://www.amsterdam.nl/zorg-ondersteuning/hulp-zorg-betalen/persoonsgebonden/?vkurl=pgb';
