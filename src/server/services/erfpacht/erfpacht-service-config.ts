import { isEnabled } from '../../config/azure-appconfiguration.ts';
import {
  httpsAgentBFF,
  type DataRequestConfig,
} from '../../config/source-api.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const featureToggle = {
  service: {
    enabled: isEnabled('ERFPACHT.service'),
  },
} as const;

export const routes = {
  protected: {
    ERFPACHT_DOSSIER_DETAILS: '/services/erfpacht/dossier/:dossierId',
    ERFPACHT_ZAAK_DETAILS: '/services/erfpacht/zaak/:uuid',
  },
} as const;

export const dataRequestConfig: DataRequestConfig = {
  url: getFromEnv('BFF_ERFPACHT_API_URL'),
  passthroughOIDCToken: true,
  httpsAgent: httpsAgentBFF,
  postponeFetch:
    !featureToggle.service.enabled || !getFromEnv('BFF_ERFPACHT_API_URL'),
  headers: {
    'X-HERA-REQUESTORIGIN': 'MijnAmsterdam',
    apiKey: getFromEnv('BFF_ENABLEU_API_KEY'),
  },
} as const;
