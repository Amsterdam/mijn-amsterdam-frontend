/// <reference types="react-scripts" />

import * as Sentry from '@sentry/react';
import 'react-app-polyfill/stable';
import 'core-js/features/object/entries';
import 'core-js/features/object/from-entries';
import 'core-js/features/array/flat-map';
import 'core-js/features/object/from-entries';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import App from './client/App';
import ApplicationError from './client/pages/ApplicationError/ApplicationError';

import './client/styles/main.scss';
import { OTAP_ENV, getOtapEnvItem } from './universal/config/env';

if (
  /MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
  navigator.userAgent.indexOf('Trident/') > -1 ||
  !('Map' in window && 'Set' in window)
) {
  window.location.replace('/no-support');
}

const release = `mijnamsterdam-frontend@${
  process.env.REACT_APP_VERSION ?? 'latest-unknown'
}`;
console.info(
  'App version: %s, Commit sha: %s, Build id:, %s',
  release,
  process.env.REACT_APP_GIT_SHA ?? 'unknown',
  process.env.REACT_APP_ADO_BUILD_ID ?? '0'
);

const sentryDSN = getOtapEnvItem('sentryDsn');

Sentry.init({
  dsn: sentryDSN,
  environment: OTAP_ENV,
  debug: OTAP_ENV === 'development',
  ignoreErrors: [
    'a[b].target.className.indexOf is not a function',
    "Failed to execute 'removeChild' on 'Node'",
  ], // Chrome => google translate extension bug
  release,
  tracesSampleRate: 0.5,
  autoSessionTracking: false,
  beforeSend(event, hint) {
    if (OTAP_ENV === 'development') {
      console.log(hint);
    }
    if (!sentryDSN) {
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

ReactDOM.render(
  <ErrorBoundary onError={sendToSentry} FallbackComponent={ApplicationError}>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')
);
