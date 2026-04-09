import { parseISO } from 'date-fns';
import z from 'zod';

import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import { ZodValidators } from '../../helpers/validation.ts';
import type { BeschikkingsResultaat } from '../zorgned/zorgned-types.ts';

export const featureToggle = {
  router: {
    private: {
      isEnabled: !IS_PRODUCTION,
    },
  },
  statusLineItems: {
    alleAfgewezenWmoAanvragen: {
      isEnabled: true,
    },
  },
  service: {
    fetchCasusAanvragen: {
      isEnabled: true,
    },
  },
} as const;

export const OAUTH_ROLE_WMO_VOORZIENINGEN = 'wmo.voorzieningen' as const;

export const routes = {
  private: {
    WMO_VOORZIENINGEN: `/services/wmo/voorzieningen`,
    WMO_VOORZIENINGEN_DETAIL: `/services/wmo/voorziening`,
  },
  protected: {
    WMO_DOCUMENT_DOWNLOAD: `/services/wmo/document`,
    WMO_DOCUMENTS_LIST_RAW: `/services/wmo/raw/documents`,
    WMO_AANVRAGEN_RAW: `/services/wmo/raw/aanvragen`,
  },
} as const;

export const ZORGNED_JZD_API_CONFIG_KEY = 'ZORGNED_JZD' as const;
export const DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH = 'Verzoek:' as const; // Documents starting with this token correspond to the 'meer informatie' step.
export const DOCUMENT_TITLE_BESLUIT_STARTS_WITH = 'Besluit:' as const; // Documents starting with this token correspond to the 'besluit' step.
export const DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE =
  'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/OJZDUploadBijlagen.aspx';
export const DOCUMENT_PGB_BESLUIT =
  'https://www.amsterdam.nl/zorg-ondersteuning/hulp-zorg-betalen/persoonsgebonden/?vkurl=pgb';

export const ZORGNED_JZD_REGELING_IDENTIFICATIE = 'wmo' as const;
export const BESCHIKTPRODUCT_RESULTAAT: BeschikkingsResultaat[] = [
  'toegewezen',
] as const;
export const DATE_END_NOT_OLDER_THAN = '2018-01-01' as const;
export const MINIMUM_REQUEST_DATE_FOR_DOCUMENTS = parseISO('2022-01-01'); // After this date documents are WCAG proof.

export const voorzieningenRequestInput = z.object({
  bsn: ZodValidators.BSN.nonoptional(),
  maActies: z
    .array(
      z.enum([
        'reparatieverzoek',
        'stopzetten',
        'stopzetten-tijdelijk',
        'stopzetten-niet-via-formulier',
      ])
    )
    .optional(),
  maProductgroep: z
    .array(
      z.enum([
        'WRA',
        'hulpmiddelen',
        'diensten',
        'PGB',
        'vergoeding',
        'AOV',
        'Alle afgewezen',
      ])
    )
    .optional(),
});

export const voorzieningDetailRequestInput = z.object({
  bsn: ZodValidators.BSN.nonoptional(),
  id: z.string().nonoptional(),
});
