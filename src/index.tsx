import './polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'styles/main.scss';
import * as Sentry from '@sentry/browser';

const sentryDSN = process.env.REACT_APP_SENTRY_DSN;
if (
  sentryDSN &&
  process.env.REACT_APP_SENTRY_ENV &&
  process.env.REACT_APP_SENTRY_ENV !== 'development'
) {
  Sentry.init({
    dsn: sentryDSN,
    environment: process.env.REACT_APP_SENTRY_ENV,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
