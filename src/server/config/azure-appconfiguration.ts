import '../../server/helpers/load-env';

// @ts-expect-error Otherwise required to update module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

let featureManager: FeatureManager | undefined;
const REFRESH_INTERVAL_MS = 5000;

export async function startAppConfiguration() {
  const endpoint = process.env.AZURE_APPCONFIG_CONNECTION_STRING;
  const appConfig = await load(endpoint, {
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
