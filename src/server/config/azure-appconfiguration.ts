import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import {
  featureToggle,
  type FeatureToggleKey,
  type FeatureToggles,
} from './feature-toggles.ts';
import { IS_DEVELOPMENT } from '../../universal/config/env.ts';

const skipAppConfiguration = process.env.BFF_SKIP_APPCONFIG === 'true';

export function getAllFeatureToggles(): Readonly<FeatureToggles> {
  return featureToggle;
}

export function isEnabled(featureToggleKey: FeatureToggleKey): boolean {
  return featureToggle[featureToggleKey];
}

export async function startAppConfiguration() {
  if (skipAppConfiguration) {
    return;
  }
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
