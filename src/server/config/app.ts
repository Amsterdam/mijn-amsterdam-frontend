import { BFF_BASE_PATH } from '../routing/bff-routes';

export const BFF_REQUEST_CACHE_ENABLED =
  typeof process.env.BFF_REQUEST_CACHE_ENABLED !== 'undefined'
    ? String(process.env.BFF_REQUEST_CACHE_ENABLED).toLowerCase() === 'true'
    : true;

export const BFF_API_BASE_URL = process.env.BFF_API_BASE_URL ?? BFF_BASE_PATH;

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
export const DAYS_IN_YEAR = 365;
