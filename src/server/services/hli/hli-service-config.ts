import https from 'https';

import type { DataRequestConfig } from '../../config/source-api.ts';
import { getCert } from '../../helpers/cert.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const featureToggle = {
  router: {
    protected: {
      isEnabled: true,
    },
  },
  service: {
    enabledStadspas: true,
    enabledRegelingen: true,
    enabledRTM: true,
    enabledAV: true,
  },
};

export const routes = {
  protected: {
    // Stadspas
    STADSPAS_TRANSACTIONS:
      '/services/stadspas/transactions/:transactionsKeyEncrypted',
    STADSPAS_BLOCK_PASS: '/services/stadspas/block/:transactionsKeyEncrypted',
    STADSPAS_UNBLOCK_PASS:
      '/services/stadspas/unblock/:transactionsKeyEncrypted',

    // AV / Zorgned
    HLI_DOCUMENT_DOWNLOAD: `/services/v1/stadspas-en-andere-regelingen/document`,
    HLI_AANVRAGEN_RAW: `/services/hli/raw/aanvragen`,
  },
};

export const ZORGNED_AV_API_CONFIG_KEY = 'ZORGNED_AV';

export const dataRequestConfigAV: DataRequestConfig = {
  method: 'post',
  url: `${getFromEnv('BFF_ZORGNED_API_BASE_URL')}`,
  headers: {
    Token: getFromEnv('BFF_ZORGNED_API_TOKEN'),
    'Content-type': 'application/json; charset=utf-8',
    'x-cache-key-supplement': 'AV',
  },
  httpsAgent: new https.Agent({
    cert: getCert('BFF_ZORGNED_AV_CERT'),
    key: getCert('BFF_ZORGNED_AV_KEY'),
  }),
};
