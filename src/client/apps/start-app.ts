import { FEATURE_TOGGLES_API_URL } from './config.ts';
import type { FeatureToggles } from '../../server/config/feature-toggles.ts';

export async function startApp(render: () => Promise<unknown>) {
  // eslint-disable-next-line no-console
  console.info(
    'Commit: %s Build: %s',
    `https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${MA_GIT_SHA}`,
    MA_BUILD_ID ?? '-1'
  );

  try {
    const response = await fetch(FEATURE_TOGGLES_API_URL);
    const featureToggles: FeatureToggles = await response.json();
    globalThis.MA_FEATURETOGGLES = featureToggles;
    await render();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching feature toggles', error);
    document.getElementById('loader')?.appendChild(
      Object.assign(document.createElement('div'), {
        id: 'loadfail',
        innerHTML:
          'De website werkt nu niet.<br/>Wij werken aan een oplossing.',
      })
    );
  }
}
