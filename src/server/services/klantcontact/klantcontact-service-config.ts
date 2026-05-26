import { isEnabled } from '../../config/azure-appconfiguration.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const featureToggle = {
  afspraken: isEnabled('KLANT_CONTACT.afspraken'),
  communicatievoorkeuren: isEnabled('KLANT_CONTACT.communicatievoorkeuren'),
};

const BASE_ROUTE = '/services/klantcontact';

export const routes = {
  BASE: BASE_ROUTE,
  VERIFICATION_REQUEST_CREATE: `${BASE_ROUTE}/verification-request/create`,
  VERIFICATION_REQUEST_VERIFY: `${BASE_ROUTE}/verification-request/verify`,
  CONTACT_SET_CONTACTGEGEVEN: `${BASE_ROUTE}/communicatievoorkeuren/set`,
  CONTACT_GET_COMMUNICATIEVOORKEUREN: `${BASE_ROUTE}/communicatievoorkeuren`,
  CONTACT_GET_DIENSTVERLENER: `${BASE_ROUTE}/dienstverlener/:naam`,
} as const;

export const salesforceDataRequestConfig = {
  // contactmomenten and afspraken are fetched from the same API, so we can use the same config for both.
  url: getFromEnv('BFF_CONTACTMOMENTEN_BASE_URL'),
  headers: {
    apiKey: getFromEnv('BFF_ENABLEU_API_KEY'),
  },
};

export const profieldienstRequestConfig = {
  url: getFromEnv('BFF_PROFIEL_API_BASE_URL'),
};
