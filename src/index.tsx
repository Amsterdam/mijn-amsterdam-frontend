import './polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'styles/main.scss';
import * as Sentry from '@sentry/browser';

const sentryDSN = process.env.REACT_APP_SENTRY_DSN;

if (
  sentryDSN &&
  process.env.REACT_APP_BUILD_ENV &&
  ['development', 'test'].includes(process.env.REACT_APP_BUILD_ENV)
) {
  Sentry.init({
    dsn: sentryDSN,
    environment: process.env.REACT_APP_BUILD_ENV,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
