import { isEnabled } from '../../config/azure-appconfiguration.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const featureToggle = {
  afspraken: isEnabled('KLANT_CONTACT.afspraken'),
  communicatievoorkeuren: isEnabled('KLANT_CONTACT.communicatievoorkeuren'),
};

const BASE_ROUTE = '/services/klantcontact';

export const routes = {
  BASE: BASE_ROUTE,
  CONTACTGEGEVEN_VERIFY: `${BASE_ROUTE}/contactgegeven/verify`,
  CONTACTGEGEVEN_CREATE: `${BASE_ROUTE}/contactgegeven/create`,
  CONTACTGEGEVEN_DELETE: `${BASE_ROUTE}/contactgegeven/delete`,
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
