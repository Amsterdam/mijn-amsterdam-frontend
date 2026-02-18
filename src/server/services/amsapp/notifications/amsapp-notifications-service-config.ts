import { IS_PRODUCTION } from '../../../../universal/config/env';
import { AMSAPP_BASE_PATH } from '../amsapp-service-config';

export const featureToggle = {
  // AmsApp notificaties
  amsNotificationsIsActive: !IS_PRODUCTION,
};

export const routes = {
  public: {
    NOTIFICATIONS_CONSUMER_REGISTRATION_LOGIN: `${AMSAPP_BASE_PATH}/notifications/login/:consumerId`,
    NOTIFICATIONS_CONSUMER_REGISTRATION_ACTION: `${AMSAPP_BASE_PATH}/notifications/consumer/:consumerId/app`, // app-landing which opens the App with a deeplink.
    NOTIFICATIONS_CONSUMER_REGISTRATION_STATUS: `${AMSAPP_BASE_PATH}/notifications/consumer/:consumerId`,
    NOTIFICATIONS_CONSUMER_REGISTRATION_OVERVIEW: `${AMSAPP_BASE_PATH}/notifications/consumer/registrations`,
  },
  private: {
    NOTIFICATIONS: `${AMSAPP_BASE_PATH}/notifications`,
    NOTIFICATIONS_JOB: `${AMSAPP_BASE_PATH}/job/notifications`,
  },
} as const;

export const apiResponseErrors = {
  DIGID_AUTH: { code: '001', message: 'Niet ingelogd met Digid' },
  AMSAPP_NOTIFICATIONS_CONSUMER_REGISTRATION_FAILED: {
    code: '002',
    message: 'Registreren van gebruiker bij notificatieservice is mislukt',
  },
  AMSAPP_NOTIFICATIONS_TRUNCATE_FAILED: {
    code: '003',
    message: 'Verwijderen van notificaties voor gebruiker is mislukt',
  },
} as const;

export const AMSAPP_NOTIFICATIONS_DEEP_LINK_BASE = 'amsterdam://mijn-amsterdam'; // Use this message when extra privacy is required.
export const DISCRETE_GENERIC_MESSAGE =
  'Er staat een bericht voor u klaar op Mijn Amsterdam.';
