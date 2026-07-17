import { IS_PRODUCTION } from '../../../../universal/config/env.ts';
import { isEnabled } from '../../../config/azure-appconfiguration.ts';
import { AMSAPP_BASE_PATH } from '../amsapp-constants.ts';

export const featureToggle = {
  amsAppUniversalAuthIsActive: isEnabled('AMSAPP.universalAuth'),
  amsAppUniversalAuthServicesAllAccessIsActive:
    isEnabled('AMSAPP.universalAuth') &&
    isEnabled('AMSAPP.universalAuth.servicesAllAccess'),
} as const;

export const routes = {
  public: {
    AMSAPP_AUTH_LOGIN: `${AMSAPP_BASE_PATH}/auth/login`,
    AMSAPP_AUTH_CALLBACK: `${AMSAPP_BASE_PATH}/auth/callback/:loginId`,
  },
  private: {
    AMSAPP_AUTH_TOKEN: `${AMSAPP_BASE_PATH}/auth/token`,
    AMSAPP_AUTH_SERVICES_ALL: `${AMSAPP_BASE_PATH}/auth/services/all`,
  },
} as const;

export const apiResponseErrors = {
  DIGID_AUTH: { code: '001', message: 'Niet ingelogd met Digid' },
  LOGIN_NOT_FOUND_OR_EXPIRED: {
    code: '002',
    message: 'Inlogsessie niet gevonden of verlopen',
  },
} as const;

export const AMSAPP_AUTH_DEEP_LINK_BASE = 'amsterdam://mijn-amsterdam';

const twentyMinutesInMs = 20 * 60 * 1000;
const twoMinutesInMs = 2 * 60 * 1000;
export const AUTHORIZATION_CODE_TTL_MS = IS_PRODUCTION
  ? twoMinutesInMs
  : twentyMinutesInMs; // In non-production environments, we set a longer TTL for easier testing.
