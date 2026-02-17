import type { DataRequestConfig } from '../../../config/source-api';
import { getFromEnv } from '../../../helpers/env';
import { getCustomApiConfig } from '../../../helpers/source-api-helpers';
import { AMSAPP_BASE_PATH } from '../amsapp-service-config';

export const apiResponseErrors = {
  DIGID_AUTH: { code: '001', message: 'Niet ingelogd met Digid' },
  ADMINISTRATIENUMMER_RESPONSE_ERROR: {
    code: '002',
    message: 'Kon het administratienummer niet ophalen',
  },
  ADMINISTRATIENUMMER_NOT_FOUND: {
    code: '003',
    message: 'Geen administratienummer gevonden',
  },
  AMSAPP_ADMINISTRATIENUMMER_DELIVERY_FAILED: {
    code: '004',
    message:
      'Verzenden van administratienummer naar de Amsterdam app niet gelukt',
  },
  ADMINISTRATIENUMMER_FAILED_TO_DECRYPT: {
    code: '005',
    message: `Could not decrypt url parameter 'administratienummerEncrypted'.`,
  },
  UNKNOWN: {
    code: '000',
    message: 'Onbekende fout',
  },
} as const;

export const routes = {
  // Publicly accessible over the internet
  public: {
    STADSPAS_AMSAPP_LOGIN: `${AMSAPP_BASE_PATH}/stadspas/login/:token`,
    STADSPAS_AMSAPP_EXCHANGE_ADMINISTRATIENUMMER: `${AMSAPP_BASE_PATH}/stadspas/administratienummer/:token`,
    STADSPAS_AMSAPP_OPENER: `${AMSAPP_BASE_PATH}/stadspas/app-landing`,
  },
  // Privately accessible over private network
  private: {
    STADSPAS_PASSEN: `${AMSAPP_BASE_PATH}/stadspas/passen/:administratienummerEncrypted`,
    STADSPAS_DISCOUNT_TRANSACTIONS: `${AMSAPP_BASE_PATH}/stadspas/aanbiedingen/transactions/:transactionsKeyEncrypted`,
    STADSPAS_BUDGET_TRANSACTIONS: `${AMSAPP_BASE_PATH}/stadspas/budget/transactions/:transactionsKeyEncrypted`,
    STADSPAS_BLOCK_PAS: `${AMSAPP_BASE_PATH}/stadspas/block/:transactionsKeyEncrypted`,
  },
} as const;

export const AMSAPP_STADSPAS_DEEP_LINK_BASE = 'amsterdam://stadspas';

const apiRequestConfig = {
  url: `${getFromEnv('BFF_AMSAPP_ADMINISTRATIENUMMER_DELIVERY_ENDPOINT')}`,
  method: 'POST',
  headers: {
    'X-Session-Credentials-Key': getFromEnv('BFF_AMSAPP_API_KEY'),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
} as const;

export function getAmsAppRequestConfig(
  overrides: Omit<DataRequestConfig, 'cacheKey_UNSAFE'>
) {
  return getCustomApiConfig(apiRequestConfig, overrides);
}
