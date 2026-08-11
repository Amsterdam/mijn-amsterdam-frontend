import z from 'zod';

import { isEnabled } from '../../config/azure-appconfiguration.ts';
import { ZodValidators } from '../../helpers/validation.ts';

export const featureToggle = {
  router: {
    private: {
      isEnabled: true,
    },
  },
  service: {
    fetchWmo: {
      addMaVoorzieningenApiProps: isEnabled(
        'WMO.fetchWmo.addMaVoorzieningenApiProps'
      ),
    },
  },
} as const;

export const OAUTH_ROLE_ZORGNED_VOORZIENINGEN = 'wmo.voorzieningen' as const;

export const routes = {
  private: {
    VOORZIENINGEN: `/services/jzd/voorzieningen`,
    VOORZIENING_DETAIL: `/services/jzd/voorziening`,
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
