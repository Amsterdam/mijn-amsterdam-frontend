import 'core-js/actual/array/to-sorted';
import 'core-js/actual/array/find-last';
import 'core-js/actual/array/find-index';
import 'core-js/actual/array/find-last-index';
import 'core-js/actual/string/replace-all';

import './client/styles/main.scss';
import { BFFApiUrls } from './client/config/api.ts';
import { type FeatureToggles } from './server/config/feature-toggles.ts';

(async function startApp() {
  // eslint-disable-next-line no-console
  console.info(
    'Commit: %s Build: %s',
    `https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${MA_GIT_SHA}`,
    MA_BUILD_ID ?? '-1'
  );

  if (
    /MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
    navigator.userAgent.indexOf('Trident/') > -1 ||
    !('Map' in window && 'Set' in window)
  ) {
    window.location.replace('/no-support');
  }

  try {
    const response = await fetch(BFFApiUrls.FEATURE_TOGGLES);
    const featureToggles: FeatureToggles = await response.json();
    globalThis.MA_FEATURETOGGLES = featureToggles;
    await import('./client/render-root.tsx');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching feature toggles', error);
    document.getElementById('loader')?.appendChild(
      Object.assign(document.createElement('div'), {
        id: 'loadfail',
        textContent: 'De website werkt nu niet. Wij werken aan een oplossing.',
      })
    );
  }
})();
