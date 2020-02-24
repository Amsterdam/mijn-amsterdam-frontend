import './polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'styles/main.scss';
import * as Sentry from '@sentry/browser';
import { IS_SENTRY_ENABLED, SENTRY_DSN } from './env';

if (SENTRY_DSN && IS_SENTRY_ENABLED) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.REACT_APP_ENV,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
