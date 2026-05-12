import type { DataRequestConfig } from '../../config/source-api.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const featureToggle = {};

const BASE_ROUTE = '/services/contact';

export const routes = {
  BASE: BASE_ROUTE,
  VERIFICATION_REQUEST_CREATE: `${BASE_ROUTE}/verification-request/create`,
  VERIFICATION_REQUEST_VERIFY: `${BASE_ROUTE}/verification-request/verify`,
  CONTACT_SET_CONTACTGEGEVEN: `${BASE_ROUTE}/communicatievoorkeuren/set`,
  CONTACT_GET_COMMUNICATIEVOORKEUREN: `${BASE_ROUTE}/communicatievoorkeuren`,
  CONTACT_GET_DIENSTVERLENER: `${BASE_ROUTE}/dienstverlener/:naam`,
} as const;

export const profieldienstRequestConfig: DataRequestConfig = {
  url: `${getFromEnv('BFF_PROFIELDIENST_BASE_URL')}`,
} as const;
