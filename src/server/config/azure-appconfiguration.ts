import '../../server/helpers/load-env';

// @ts-expect-error Otherwise required to update module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import { IS_DEVELOPMENT } from '../../universal/config/env';

let featureManager: FeatureManager | undefined;
const REFRESH_INTERVAL_MS = 5000;

const DISABLED_DEVELOPMENT_FEATURES: string[] = [];

export async function startAppConfiguration() {
  const connectionString = process.env.APPCONFIGURATION_CONNECTION_STRING;
  if (!connectionString) {
    if (IS_DEVELOPMENT) {
      featureManager = {
        isEnabled: isEnabledMock,
      } as unknown as FeatureManager;
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
        enabled: true,
        refreshIntervalInMs: REFRESH_INTERVAL_MS * 2,
      },
    },
  });
  featureManager = new FeatureManager(
    new ConfigurationMapFeatureFlagProvider(appConfig)
  );
  while (true) {
    await appConfig.refresh();
    await new Promise((resolve) => setTimeout(resolve, REFRESH_INTERVAL_MS));
  }
}

export function getFeatureManager(): FeatureManager {
  if (!featureManager) {
    throw Error('No featureManager defined, call startAppConfiguration first.');
  }
  return featureManager;
}

async function isEnabledMock(featureName: string): Promise<boolean> {
  return !DISABLED_DEVELOPMENT_FEATURES.includes(featureName);
}
