/// <reference types="react-scripts" />

import * as Sentry from '@sentry/react';
import 'react-app-polyfill/stable';
import 'core-js/features/object/entries';
import 'core-js/features/array/flat-map';
import 'core-js/features/object/from-entries';
import ReactDOM from 'react-dom';
import App from './client/App';

import './client/styles/main.scss';
import { ENV, getOtapEnvItem } from './universal/config/env';

if (
  /MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
  navigator.userAgent.indexOf('Trident/') > -1 ||
  !('Map' in window && 'Set' in window)
) {
  window.location.replace('/no-support');
}

const release = `mijnamsterdam-frontend@${
  process.env.REACT_APP_VERSION || 'latest-unknown'
}`;
console.info('App version: ' + release);

Sentry.init({
  dsn: getOtapEnvItem('sentryDsn'),
  environment: ENV,
  debug: ENV === 'development',
  ignoreErrors: [
    'a[b].target.className.indexOf is not a function',
    "Failed to execute 'removeChild' on 'Node'",
  ], // Chrome => google translate extension bug
  release,
  tracesSampleRate: 0.5,
  autoSessionTracking: false,
});

ReactDOM.render(<App />, document.getElementById('root'));
