import z from 'zod';

import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import { ZodValidators } from '../../helpers/validation.ts';

export const featureToggle = {
  router: {
    private: {
      isEnabled: !IS_PRODUCTION,
    },
  },
  service: {
    fetchCasusAanvragen: {
      isEnabled: true,
    },
  },
} as const;

export const OAUTH_ROLE_JZD_VOORZIENINGEN = 'wmo.voorzieningen' as const;

export const routes = {
  private: {
    JZD_VOORZIENINGEN: `/services/jzd/voorzieningen`,
    JZD_VOORZIENING_DETAIL: `/services/jzd/voorziening`,
  },
  protected: {
    WMO_DOCUMENT_DOWNLOAD: `/services/wmo/document`,
    WMO_DOCUMENTS_LIST_RAW: `/services/wmo/raw/documents`,
    WMO_AANVRAGEN_RAW: `/services/wmo/raw/aanvragen`,
    LLV_DOCUMENT_DOWNLOAD: `/services/llv/document`,
  },
} as const;

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
