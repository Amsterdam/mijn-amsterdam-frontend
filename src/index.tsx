import 'react-app-polyfill/ie11';
import '@babel/polyfill';
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

// IE11 Element.closest() polyfill
if (!Element.prototype.matches) {
  Element.prototype.matches =
    (Element.prototype as any).msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s: string) {
    let el = this;

    do {
      if (el.matches(s)) return el;
      (el as any) = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

ReactDOM.render(<App />, document.getElementById('root'));
