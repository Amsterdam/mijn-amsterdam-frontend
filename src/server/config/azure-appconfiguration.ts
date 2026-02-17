import { writeFileSync } from 'fs';

// @ts-expect-error Otherwise required to update module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import {
  FeatureName as FeatureToggleNames,
  featureNames,
} from './featurenames';
import { IS_DEVELOPMENT } from '../../universal/config/env';
import { areArraysEqual } from '../../universal/helpers/utils';

const REFRESH_INTERVAL_MS = 5000;

const DISABLED_DEVELOPMENT_FEATURES: string[] = [];

let featureManager: FeatureManager | undefined;
// Cannot import type, see ts-expect-error above.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let appConfig: any;

// Is mutated by the Appconfiguration. Locally this object will have precedence.
export const featureToggle = {
  ['AFIS.EMandates']: true,
};

export type FeatureToggles = typeof featureToggle;
type FeatureToggleKeys = keyof FeatureToggles;

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
      (await featureManager.listFeatureNames()) as FeatureToggleKeys[];
    for (const name of names) {
      featureToggle[name] = await featureManager.isEnabled(name);
    }
  }
}

async function isEnabledMock(
  featureName: FeatureToggleNames
): Promise<boolean> {
  return !DISABLED_DEVELOPMENT_FEATURES.includes(featureName);
}

async function updateFeaturNameType(fm: FeatureManager): Promise<void> {
  // We automaticly keep these up to date so this type is safe to cast
  const newFeatureNames = (await fm.listFeatureNames()) as FeatureToggleNames[];

  if (!areArraysEqual(newFeatureNames, featureNames as unknown as string[])) {
    // const featureToggleObject = expandFeatureNameFields(newFeatureNames);
    // console.dir(featureToggleObject);
    const data = `
// This file is generated, do not manually adjust

export const featureToggleNames = ${JSON.stringify(newFeatureNames, null, 2)} as const;

export type FeatureName = (typeof featureToggleNames)[number];
`;
    writeFileSync('./src/server/config/featurenames.ts', data);
  }
}
