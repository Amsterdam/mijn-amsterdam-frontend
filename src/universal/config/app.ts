import { IS_PRODUCTION } from './env';

export const MIJN_AMSTERDAM = 'Mijn Amsterdam';
/**
 * Used for testing and development purposes we can pass a set of arbitrary parameters to the BFF.
 * */
export const streamEndpointQueryParamKeys = {
  tipsCompareDate: 'tipsCompareDate', //For example, tipsCompareDate=2023-01-31 this will change the date that is used to compare with dates being used in the tips controller.
  ...(!IS_PRODUCTION
    ? { adHocDependencyRequestCacheTtlMs: 'adHocDependencyRequestCacheTtlMs' } // Ad hoc setting for default cache ttl of requests to external api's. This will nog override explicitly set cache ttl's.
    : {}),
} as const;

export const DEFAULT_PROFILE_TYPE = 'private';

const ONE_MINUTE_MS = 60000;
export const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;

/**
 * The default number of months to keep notifications after a zaak is processed / afgehandeld.
 */
export const MONTHS_TO_KEEP_NOTIFICATIONS = 3;
