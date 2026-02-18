import 'core-js/actual/array/to-sorted';
import 'core-js/actual/array/find-last';
import 'core-js/actual/array/find-index';
import 'core-js/actual/array/find-last-index';
import 'core-js/actual/string/replace-all';

import './client/styles/main.scss';
import { BFFApiUrls } from './client/config/api';
import { type FeatureToggles } from './server/config/azure-appconfiguration';

declare global {
  interface Window {
    MA_FEATURETOGGLES?: FeatureToggles;
  }
}

(async function startApp() {
  const response = await fetch(BFFApiUrls.FEATURE_TOGGLES);
  const featureToggles: FeatureToggles = await response.json();
  window.MA_FEATURETOGGLES = featureToggles;

  if (
    /MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
    navigator.userAgent.indexOf('Trident/') > -1 ||
    !('Map' in window && 'Set' in window)
  ) {
    window.location.replace('/no-support');
  }

  // eslint-disable-next-line no-console
  console.info(
    'Commit: %s Build: %s',
    `https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${MA_GIT_SHA}`,
    MA_BUILD_ID ?? '-1'
  );

  await import('./render-root');
})();
