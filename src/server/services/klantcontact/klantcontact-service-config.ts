import { isEnabled } from '../../config/azure-appconfiguration.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const featureToggle = {
  afspraken: isEnabled('KLANT_CONTACT.afspraken'),
};

export const salesforceDataRequestConfig = {
  // contactmomenten and afspraken are fetched from the same API, so we can use the same config for both.
  url: getFromEnv('BFF_CONTACTMOMENTEN_BASE_URL'),
  headers: {
    apiKey: getFromEnv('BFF_ENABLEU_API_KEY'),
  },
};
