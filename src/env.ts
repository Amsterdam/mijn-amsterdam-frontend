export const BUILD_ENV = `${process.env.REACT_APP_BUILD_ENV}`;

export const IS_ACCEPTANCE = process.env.REACT_APP_BUILD_ENV === 'acceptance';
export const IS_PRODUCTION = process.env.REACT_APP_BUILD_ENV === 'production';
export const IS_TEST = process.env.REACT_APP_BUILD_ENV === 'test';
export const IS_DEVELOPMENT = process.env.REACT_APP_BUILD_ENV === 'development';

export const IS_SENTRY_ENABLED = !(IS_DEVELOPMENT || IS_TEST);
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;

export const IS_ANALYTICS_ENABLED = ['production', 'acceptance'].includes(
  BUILD_ENV
);
