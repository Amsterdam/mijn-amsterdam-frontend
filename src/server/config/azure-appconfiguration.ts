// @ts-expect-error It is otherwise required to update the module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import { GLOBALTHIS_FEATURETOGGLE_KEY } from '../../client/config/feature-toggles';
import { IS_DEVELOPMENT } from '../../universal/config/env';

// Is mutated by the Appconfiguration. Locally this object will be used as is.
const featureToggle = {
  ['AFIS.EMandates']: true,
  ['AMSAPP.notificationService']: true,
  ['BRP.aantalBewonersOpAdresTonen']: true,
  ['USER_FEEDBACK.fetchSurvey']: true,
  ['cobrowse']: false,
};
// Make sure featureToggles imported from frontend *-thema-configs have access.
const g = globalThis as unknown as {
  [GLOBALTHIS_FEATURETOGGLE_KEY]: FeatureToggles;
};
g[GLOBALTHIS_FEATURETOGGLE_KEY] = featureToggle;

export type FeatureToggles = typeof featureToggle;
export type FeatureToggleKey = keyof FeatureToggles;

export function getAllFeatureToggles(): Readonly<FeatureToggles> {
  return featureToggle;
}

export function isEnabled(featureToggleKey: FeatureToggleKey): boolean {
  const enabled = featureToggle[featureToggleKey];
  if (enabled === undefined) {
    throw Error(`FeatureToggle '${featureToggleKey}' does not exist`);
  }
  return enabled;
}

export async function startAppConfiguration() {
  const connectionString = process.env.APPCONFIGURATION_CONNECTION_STRING;
  if (!connectionString) {
    if (IS_DEVELOPMENT) {
      return;
    }
    throw Error(
      'Environment variable APPCONFIGURATION_CONNECTION_STRING is not defined'
    );
  }
  const appConfig = await load(connectionString, {
    featureFlagOptions: {
      enabled: true,
      refresh: {
        enabled: false,
      },
    },
  });
  const featureManager = new FeatureManager(
    new ConfigurationMapFeatureFlagProvider(appConfig)
  );
  const names = (await featureManager.listFeatureNames()) as FeatureToggleKey[];
  for (const name of names) {
    featureToggle[name] = await featureManager.isEnabled(name);
  }
}
