// @ts-expect-error Otherwise required to update module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import { IS_DEVELOPMENT } from '../../universal/config/env';

const REFRESH_INTERVAL_MS = 5000;

const DISABLED_DEVELOPMENT_FEATURES: string[] = [];

let featureManager: FeatureManager | undefined;
// Cannot import type, see ts-expect-error above.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let appConfig: any;

// Is mutated by the Appconfiguration. Locally this object will have precedence.
export const featureToggle = {
  ['AFIS.EMandates']: true,
  ['cobrowse']: false,
};

export type FeatureToggles = typeof featureToggle;
export type FeatureToggleKey = keyof FeatureToggles;

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
  appConfig = await load(connectionString, {
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
  if (IS_DEVELOPMENT) {
    // Automatic type updating when new features are added in the Appconfiguration.
    // RP TODO: delete?
    // updateFeaturNameType(featureManager);
  } else {
    const names =
      (await featureManager.listFeatureNames()) as FeatureToggleKey[];
    for (const name of names) {
      featureToggle[name] = await featureManager.isEnabled(name);
    }
  }
}

async function isEnabledMock(featureName: FeatureToggleKey): Promise<boolean> {
  return !DISABLED_DEVELOPMENT_FEATURES.includes(featureName);
}
