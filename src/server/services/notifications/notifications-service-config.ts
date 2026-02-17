import type { ApiError } from './notifications-types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { RETURNTO_AMSAPP_NOTIFICATIES_APP_LANDING } from '../../auth/auth-config';
import { authRoutes } from '../../auth/auth-routes';
import { getFromEnv } from '../../helpers/env';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';

export const featureToggle = {
  // AmsApp notificaties
  amsNotificationsIsActive: !IS_PRODUCTION,
};

const AMSAPP_BASE = '/services/amsapp';

export const routes = {
  public: {
    NOTIFICATIONS_LOGIN: `${AMSAPP_BASE}/notifications/login/:consumerId`,
    NOTIFICATIONS_APP: `${AMSAPP_BASE}/notifications/app`,
    NOTIFICATIONS_CONSUMER_APP: `${AMSAPP_BASE}/notifications/consumer/:consumerId/app`,
    NOTIFICATIONS_CONSUMER: `${AMSAPP_BASE}/notifications/consumer/:consumerId`,
  },
  private: {
    NOTIFICATIONS: `${AMSAPP_BASE}/notifications`,
    NOTIFICATIONS_JOB: `${AMSAPP_BASE}/job/notifications`,
  },
} as const;

export const apiResponseErrors: Record<string, ApiError> = {
  DIGID_AUTH: { code: '001', message: 'Niet ingelogd met Digid' },
  AMSAPP_DELIVERY_FAILED: {
    code: '002',
    message: 'Verzenden van consumerId naar de Amsterdam app niet gelukt',
  },
  UNKNOWN: {
    code: '000',
    message: 'Onbekende fout',
  },
} as const;

export const maFrontendUrl = getFromEnv('MA_FRONTEND_URL')!;

export const nonce = getFromEnv('BFF_AMSAPP_NONCE')!;
export const logoutUrl = generateFullApiUrlBFF(authRoutes.AUTH_LOGOUT_DIGID, [
  { returnTo: RETURNTO_AMSAPP_NOTIFICATIES_APP_LANDING },
]);
