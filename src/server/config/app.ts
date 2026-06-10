import { IS_PRODUCTION } from '../../universal/config/env.ts';
import { getFromEnv } from '../helpers/env.ts';
import { BFF_BASE_PATH, BFF_BASE_PATH_ADMIN } from '../routing/bff-routes.ts';

export const BFF_REQUEST_CACHE_ENABLED =
  typeof process.env.BFF_REQUEST_CACHE_ENABLED !== 'undefined'
    ? String(process.env.BFF_REQUEST_CACHE_ENABLED).toLowerCase() === 'true'
    : true;

export const BFF_API_BASE_URL = process.env.BFF_API_BASE_URL ?? BFF_BASE_PATH;
export const BFF_API_ADMIN_BASE_URL =
  process.env.BFF_API_BASE_URL_ADMIN ?? BFF_BASE_PATH_ADMIN;

export const MA_FRONTEND_URL_PRODUCTION = 'https://mijn.amsterdam.nl';
export const MA_FRONTEND_URL = getFromEnv('MA_FRONTEND_URL', true, true)!;

// In production, enforce that MA_FRONTEND_URL starts with the expected production URL to prevent misconfiguration.
if (IS_PRODUCTION && !MA_FRONTEND_URL.startsWith(MA_FRONTEND_URL_PRODUCTION)) {
  throw new Error(
    `In production, MA_FRONTEND_URL must start with ${MA_FRONTEND_URL_PRODUCTION}. Current value: ${MA_FRONTEND_URL}`
  );
}

export const RELEASE_VERSION = `mijnamsterdam-bff@${process.env.MA_RELEASE_VERSION_TAG ?? 'notset'}`;

// Urls used in the BFF api
// Microservices (Tussen Api) base url
const DEFAULT_BFF_PORT = 5000;
export const BFF_HOST = process.env.BFF_HOST || 'localhost';
export const BFF_PORT = process.env.BFF_PORT || DEFAULT_BFF_PORT;

export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
export const ONE_MINUTE_SECONDS = 60;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;
export const DAYS_IN_YEAR = 365;
