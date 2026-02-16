import { writeFileSync } from 'fs';

// @ts-expect-error Otherwise required to update module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import { FeatureName, featureNames } from './featurenames';
import { IS_DEVELOPMENT } from '../../universal/config/env';
import { areArraysEqual } from '../../universal/helpers/utils';

const REFRESH_INTERVAL_MS = 5000;

const DISABLED_DEVELOPMENT_FEATURES: string[] = [];

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
  // Automatic type updating when new features are added in the Appconfiguration.
  if (IS_DEVELOPMENT) {
    updateFeaturNameType(featureManager);
  }
}

/** Get the featureToggle's enabled status. When not found this will return false */
export async function isEnabled(featureName: FeatureName): Promise<boolean> {
  if (!featureManager) {
    throw Error('No featureManager defined, call startAppConfiguration first.');
  }
  return featureManager.isEnabled(featureName);
}

async function isEnabledMock(featureName: FeatureName): Promise<boolean> {
  return !DISABLED_DEVELOPMENT_FEATURES.includes(featureName);
}

async function updateFeaturNameType(fm: FeatureManager): Promise<void> {
  // We automaticly keep these up to date so this type is safe to cast
  const newFeatureNames = (await fm.listFeatureNames()) as FeatureName[];

  if (!areArraysEqual(newFeatureNames, featureNames as unknown as string[])) {
    // const featureToggleObject = expandFeatureNameFields(newFeatureNames);
    // console.dir(featureToggleObject);
    const data = `
// This file is generated, do not manually adjust

export const featureNames = ${JSON.stringify(newFeatureNames, null, 2)} as const;

export type FeatureName = (typeof featureNames)[number];
`;
    writeFileSync('./src/server/config/featurenames.ts', data);
  }
}
