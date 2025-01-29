// For testing and development purposes we can pass a set of arbitrary parameters to the BFF.
// For example, tipsCompareDate=2023-01-31 this will change the date that is used to compare with dates being used in the tips controller.
export const streamEndpointQueryParamKeys = {
  tipsCompareDate: 'tipsCompareDate',
};

export const DEFAULT_PROFILE_TYPE = 'private';

const ONE_MINUTE_MS = 60000;
// eslint-disable-next-line no-magic-numbers
export const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;
