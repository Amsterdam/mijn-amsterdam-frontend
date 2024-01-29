import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './client/App';
import ApplicationError from './client/pages/ApplicationError/ApplicationError';
import './client/styles/main.scss';
import { IS_AZ, IS_DEVELOPMENT, OTAP_ENV } from './universal/config/env';

if (
  /MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
  navigator.userAgent.indexOf('Trident/') > -1 ||
  !('Map' in window && 'Set' in window)
) {
  window.location.replace('/no-support');
}

const release = `mijnamsterdam-frontend@${MA_APP_VERSION}`;
console.info(
  'App version: %s, Commit sha: %s, Build id:, %s',
  release,
  MA_GIT_SHA ?? '-1',
  MA_BUILD_ID ?? '-1'
);

Sentry.init({
  dsn: import.meta.env.REACT_APP_SENTRY_DSN,
  environment: `${IS_AZ ? 'az-' : ''}${OTAP_ENV}`,
  debug: IS_DEVELOPMENT,
  ignoreErrors: [
    'a[b].target.className.indexOf is not a function',
    "Failed to execute 'removeChild' on 'Node'",
  ], // Chrome => google translate extension bug
  release,
  tracesSampleRate: 0.5,
  autoSessionTracking: false,
  beforeSend(event, hint) {
    if (IS_DEVELOPMENT) {
      console.log(hint);
    }
    if (!import.meta.env.REACT_APP_SENTRY_DSN) {
      return null;
    }

    return event;
  },
});

const sendToSentry = (error: Error, info: { componentStack: string }) => {
  Sentry.captureException(error, {
    extra: {
      componentStack: info.componentStack,
    },
  });
};

const root = createRoot(document.getElementById('root')!);

root.render(
  <ErrorBoundary onError={sendToSentry} FallbackComponent={ApplicationError}>
    <App />
  </ErrorBoundary>
);
