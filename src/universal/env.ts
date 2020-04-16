export const ENV = `${process.env.REACT_APP_ENV || 'development'}`;

export const IS_ACCEPTANCE = ENV === 'acceptance';
export const IS_PRODUCTION = ENV === 'production';
export const IS_DEVELOPMENT = ENV === 'development';
export const IS_E2E = ENV === 'e2e';

export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
export const BFF_SENTRY_DSN = process.env.REACT_APP_BFF_SENTRY_DSN;
export const ANALYTICS_SITE_ID = process.env.REACT_APP_ANALYTICS_SITE_ID;

export const IS_AP = IS_ACCEPTANCE || IS_PRODUCTION;
export const IS_MAPS_ENABLED = !IS_E2E;

export const IS_ANALYTICS_ENABLED = IS_AP && !!ANALYTICS_SITE_ID;
export const IS_SENTRY_ENABLED = IS_AP && !!SENTRY_DSN;
