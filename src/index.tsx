import { AppInsightsErrorBoundary } from '@microsoft/applicationinsights-react-js';
import { createRoot } from 'react-dom/client';

import App from './client/App';
import ApplicationError from './client/pages/ApplicationError/ApplicationError';
import './client/styles/main.scss';
import { reactPlugin } from './client/helpers/monitoring';

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
  `Current commit: https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${MA_GIT_SHA}`,
  MA_BUILD_ID ?? '-1'
);

const root = createRoot(document.getElementById('root')!);

root.render(
  <AppInsightsErrorBoundary
    onError={ApplicationError}
    appInsights={reactPlugin}
  >
    <App />
  </AppInsightsErrorBoundary>
);
