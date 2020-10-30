/// <reference types="react-scripts" />

import './client/polyfill';

import * as Sentry from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './client/App';

import './client/styles/main.scss';
import { ENV, getOtapEnvItem } from './universal/config/env';

Sentry.init({
  dsn: getOtapEnvItem('sentryDsn'),
  environment: ENV,
  debug: ENV === 'development',
  ignoreErrors: [
    'a[b].target.className.indexOf is not a function',
    "Failed to execute 'removeChild' on 'Node'",
  ], // Chrome => google translate extension bug
});

ReactDOM.render(<App />, document.getElementById('root'));
