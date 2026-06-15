import z from 'zod';

import { isEnabled } from '../../config/azure-appconfiguration.ts';
import https from 'node:https';

import z from 'zod';

import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import {
  type DataRequestConfig,
  httpsAgentConfigBFF,
} from '../../config/source-api.ts';
import { getCert } from '../../helpers/cert.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { ZodValidators } from '../../helpers/validation.ts';

export const featureToggle = {
  router: {
    private: {
      isEnabled: true,
    },
  },
  service: {
    fetchCasusAanvragen: {
      isEnabled: true,
    },
    fetchWmo: {
      addMaVoorzieningenApiProps: isEnabled(
        'WMO.fetchWmo.addMaVoorzieningenApiProps'
      ),
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
    LLV_DOCUMENT_DOWNLOAD: `/services/llv/document`,
    JZD_AANVRAGEN_RAW: `/services/jzd/raw/aanvragen`,
    JZD_DOCUMENTS_LIST_RAW: `/services/jzd/raw/documents`,
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
}); // These are different users in the Zorgned API.

export const ZORGNED_USER_KEYS = [
  'ZORGNED_WMO',
  'ZORGNED_LEERLINGENVERVOER',
] as const;

export type ZorgnedApiConfigKey = (typeof ZORGNED_USER_KEYS)[number];

const apiRequestConfigWMO: DataRequestConfig = {
  method: 'post',
  url: `${getFromEnv('BFF_ZORGNED_API_BASE_URL')}`,
  headers: {
    Token: getFromEnv('BFF_ZORGNED_API_TOKEN'),
    'Content-type': 'application/json; charset=utf-8',
    'x-cache-key-supplement': 'WMO',
  },
  httpsAgent: new https.Agent(httpsAgentConfigBFF),
};

const apiRequestConfigLLV: DataRequestConfig = {
  method: 'post',
  url: `${getFromEnv('BFF_ZORGNED_API_BASE_URL')}`,
  headers: {
    Token: getFromEnv('BFF_ZORGNED_API_TOKEN'),
    'Content-type': 'application/json; charset=utf-8',
    'x-cache-key-supplement': 'LLV',
  },
  httpsAgent: new https.Agent({
    cert: getCert('BFF_ZORGNED_LEERLINGENVERVOER_CERT'),
    key: getCert('BFF_ZORGNED_LEERLINGENVERVOER_KEY'),
  }),
};

export const jzdDataRequestConfigs: Record<
  ZorgnedApiConfigKey,
  DataRequestConfig
> = {
  ZORGNED_WMO: apiRequestConfigWMO,
  ZORGNED_LEERLINGENVERVOER: apiRequestConfigLLV,
};
