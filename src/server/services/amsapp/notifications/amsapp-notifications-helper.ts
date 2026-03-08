const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
export const getSevenDaysAgoISOString = () =>
  new Date(Date.now() - SEVEN_DAYS_IN_MS).toISOString();
