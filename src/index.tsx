/// <reference path="./universal/types/global.d.ts" />
/// <reference types="react-scripts" />

import './client/polyfill';
import './client/styles/main.scss';

import * as Sentry from '@sentry/browser';

import { IS_SENTRY_ENABLED, SENTRY_DSN, ENV } from './universal/env';

import App from './client/App';
import React from 'react';
import ReactDOM from 'react-dom';

if (SENTRY_DSN && IS_SENTRY_ENABLED) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
