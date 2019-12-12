export const BUILD_ENV = `${process.env.REACT_APP_BUILD_ENV}`;

export const isSentryEnabled = !['development', 'test'].includes(BUILD_ENV);
export const sentryDSN = process.env.REACT_APP_SENTRY_DSN;

export const isAnalyticsEnabled = ['production', 'acceptance'].includes(
  BUILD_ENV
);
