export const BUILD_ENV = `${process.env.REACT_APP_BUILD_ENV}`;

export const IS_ACCEPTANCE = process.env.REACT_APP_BUILD_ENV === 'acceptance';
export const IS_PRODUCTION = process.env.REACT_APP_BUILD_ENV === 'production';
export const IS_TEST = process.env.REACT_APP_BUILD_ENV === 'test';
export const IS_DEVELOPMENT = process.env.REACT_APP_BUILD_ENV === 'development';
export const IS_E2E = process.env.REACT_APP_BUILD_ENV === 'e2e';

export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;

export const IS_AP = IS_ACCEPTANCE || IS_PRODUCTION;
export const IS_MAPS_ENABLED = !IS_E2E;

export const IS_ANALYTICS_ENABLED = IS_AP;
export const IS_SENTRY_ENABLED = IS_AP;
