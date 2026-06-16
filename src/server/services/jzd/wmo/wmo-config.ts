import { parseISO } from 'date-fns';

import type { BeschikkingsResultaat } from '../../zorgned/zorgned-types.ts';

export const ZORGNED_WMO_API_CONFIG_KEY = 'ZORGNED_WMO' as const;
export const DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH = 'Verzoek:' as const; // Documents starting with this token correspond to the 'meer informatie' step.
export const DOCUMENT_TITLE_BESLUIT_STARTS_WITH = 'Besluit:' as const; // Documents starting with this token correspond to the 'besluit' step.
export const DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE =
  'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/OJZDUploadBijlagen.aspx';
export const DOCUMENT_PGB_BESLUIT =
  'https://www.amsterdam.nl/zorg-ondersteuning/hulp-zorg-betalen/persoonsgebonden/?vkurl=pgb';

export const ZORGNED_WMO_REGELING_IDENTIFICATIE = 'wmo' as const;
export const BESCHIKTPRODUCT_RESULTAAT: BeschikkingsResultaat[] = [
  'toegewezen',
] as const;
export const DATE_END_NOT_OLDER_THAN = '2018-01-01' as const;
export const MINIMUM_REQUEST_DATE_FOR_DOCUMENTS = parseISO('2022-01-01'); // After this date documents are WCAG proof.

export const FAKE_DECISION_DOCUMENT_ID = 'besluit-document-mist';

export const jzdStatusStepActies = {
  AANVRAAG: 'Melding ontvangen',
  IN_BEHANDELING: 'In behandeling bij de gemeente',
  MEER_INFORMATIE: 'Meer informatie opgevraagd',
  MEER_AANGELEVERD: 'Meer informatie aangeleverd',
} as const;

export const DECISION_STEP_STATUS = 'Besluit';
