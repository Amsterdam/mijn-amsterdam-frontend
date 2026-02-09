import '../../server/helpers/load-env';

// @ts-expect-error Otherwise required to update module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import { IS_DEVELOPMENT } from '../../universal/config/env';
import { createBFFRouter } from '../routing/route-helpers';

const REFRESH_INTERVAL_MS = 5000;

const DISABLED_DEVELOPMENT_FEATURES: string[] = [];

const BASE_PATH = '/appconfiguration';
const REFRESH_ROUTE = `${BASE_PATH}/refresh`;

let featureManager: FeatureManager | undefined;
// Cannot import type, see ts-expect-error above.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let appConfig: any;

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

export const appConfigurationRouter = {
  private: createBFFRouter({
    id: 'appconfiguration-router-private',
  }),
};

appConfigurationRouter.private.get(REFRESH_ROUTE, async (_req, res) => {
  if (!appConfig) {
    throw Error('No AppConfig defined, call startAppConfiguration first.');
  }
  appConfig.refresh();
  res.send('<h1>Refresh Appconfiguration succesful</h1>');
});
