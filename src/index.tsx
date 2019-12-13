import './polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'styles/main.scss';
import * as Sentry from '@sentry/browser';
import { isSentryEnabled, sentryDSN } from './env';

if (sentryDSN && isSentryEnabled) {
  Sentry.init({
    dsn: sentryDSN,
    environment: process.env.REACT_APP_BUILD_ENV,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
