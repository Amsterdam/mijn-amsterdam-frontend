import { ErrorInfo } from 'react';

import { AppInsightsErrorBoundary } from '@microsoft/applicationinsights-react-js';
import { createRoot } from 'react-dom/client';

import App from './client/App';
import ApplicationError from './client/pages/ApplicationError/ApplicationError';
import './client/styles/main.scss';
import { captureMessage, reactPlugin } from './client/utils/monitoring';

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

const sendToMonitoring = (error: Error, info: ErrorInfo) => {
  captureMessage(`Kritieke applicatie fout: ${error.message}`, {
    severity: 'critical',
    properties: {
      componentStack: info.componentStack,
    },
  });
};

const root = createRoot(document.getElementById('root')!);

root.render(
  <AppInsightsErrorBoundary
    onError={ApplicationError}
    appInsights={reactPlugin}
  >
    <App />
  </AppInsightsErrorBoundary>
);
