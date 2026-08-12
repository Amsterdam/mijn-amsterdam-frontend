import {
  AppConfigurationClient,
  featureFlagContentType,
  featureFlagPrefix,
  isFeatureFlag,
  parseFeatureFlag,
} from '@azure/app-configuration';

import {
  featureToggle,
  type FeatureToggleKey,
  type FeatureToggles,
} from './feature-toggles.ts';
import { opsFeatureToggle } from './ops-feature-toggles.ts';
import { IS_DEVELOPMENT } from '../../universal/config/env.ts';
import { entries } from '../../universal/helpers/utils.ts';
import { logger } from '../logging.ts';

const skipAppConfiguration = process.env.BFF_SKIP_APPCONFIG === 'true';
let appConfigClient: AppConfigClient | null | undefined;

type AppConfigClient = Pick<
  AppConfigurationClient,
  'addConfigurationSetting' | 'listConfigurationSettings'
>;

async function fetchBooleanFeatureFlags(
  appConfigurationClient: AppConfigClient
): Promise<Record<string, boolean>> {
  const featureFlags: Record<string, boolean> = {};

  for await (const setting of appConfigurationClient.listConfigurationSettings({
    keyFilter: `${featureFlagPrefix}*`,
  })) {
    if (!isFeatureFlag(setting)) {
      continue;
    }

    const parsedFeatureFlag = parseFeatureFlag(setting);
    const featureFlagName =
      parsedFeatureFlag.value.id ??
      parsedFeatureFlag.key.replace(featureFlagPrefix, '');

    featureFlags[featureFlagName] = parsedFeatureFlag.value.enabled;
  }

  return featureFlags;
}

function isConflictError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if (!('statusCode' in error)) {
    return false;
  }

  return (error.statusCode === 409 || error.statusCode === 412) as boolean;
}

async function provisionFeatureFlags(
  appConfigurationClient: AppConfigClient,
  featureFlags: Record<string, boolean>
): Promise<Record<string, boolean>> {
  const provisionedFeatureFlags: Record<string, boolean> = {};

  for (const [featureFlagKey, enabled] of entries(featureFlags)) {
    try {
      const featureFlagSettingValue = JSON.stringify({
        id: featureFlagKey,
        enabled,
        conditions: {
          client_filters: [],
          requirement_type: 'Any',
        },
      });

      await appConfigurationClient.addConfigurationSetting({
        key: `${featureFlagPrefix}${featureFlagKey}`,
        contentType: featureFlagContentType,
        value: featureFlagSettingValue,
      });
      provisionedFeatureFlags[featureFlagKey] = enabled;
    } catch (error) {
      if (isConflictError(error)) {
        continue;
      }

      throw error;
    }
  }

  return provisionedFeatureFlags;
}

function getAppConfigClient(): AppConfigClient | null {
  if (appConfigClient !== undefined) {
    return appConfigClient;
  }

  if (skipAppConfiguration) {
    appConfigClient = null;
    return appConfigClient;
  }

  const connectionString = process.env.APPCONFIGURATION_CONNECTION_STRING;
  if (!connectionString) {
    if (!IS_DEVELOPMENT) {
      throw Error(
        'Environment variable APPCONFIGURATION_CONNECTION_STRING is not defined'
      );
    }
    appConfigClient = null;
    return appConfigClient;
  }

  appConfigClient = new AppConfigurationClient(connectionString);
  return appConfigClient;
}

export function getAllFeatureToggles(): Readonly<FeatureToggles> {
  return featureToggle;
}

function filterLocalFeatureToggles(
  remote: Record<string, boolean>,
  local: Record<string, boolean>
): Record<string, boolean> {
  const remoteKeys = new Set(Object.keys(remote));
  return Object.entries(local).reduce(
    (acc, [key, value]) => {
      if (!remoteKeys.has(key)) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, boolean>
  );
}

export async function startAppConfiguration() {
  const appConfigurationClient = getAppConfigClient();
  if (!appConfigurationClient) {
    return;
  }

  const remoteFeatureFlags = await fetchBooleanFeatureFlags(
    appConfigurationClient
  );

  const localOnlyFeatureFlags = filterLocalFeatureToggles(
    remoteFeatureFlags,
    featureToggle
  );

  const resolvedFeatureFlags = {
    ...localOnlyFeatureFlags,
    ...remoteFeatureFlags,
  };

  for (const [featureFlagKey, enabled] of Object.entries(
    resolvedFeatureFlags
  )) {
    if (featureFlagKey.startsWith('OPS.')) {
      opsFeatureToggle[featureFlagKey] = enabled;
      continue;
    }

    featureToggle[featureFlagKey as FeatureToggleKey] = enabled;
  }
}

export function isFeatureEnabled(featureToggleKey: FeatureToggleKey): boolean {
  return featureToggle[featureToggleKey] ?? false;
}

function ensureOpsPrefix(toggleKey: string): string {
  return toggleKey.startsWith('OPS.') ? toggleKey : `OPS.${toggleKey}`;
}
export function isOpsEnabled(toggleKey: string): boolean {
  const opsToggleKey = ensureOpsPrefix(toggleKey);

  const resolvedOpsToggle = opsFeatureToggle[opsToggleKey];

  if (typeof resolvedOpsToggle !== 'boolean') {
    logger.debug(
      `OPS feature toggle "${opsToggleKey}" is not a boolean or does not exist.`
    );
    return true;
  }

  return resolvedOpsToggle;
}

export async function ensureOpsFlagsExist(
  toggleKeys: ReadonlyArray<string>
): Promise<void> {
  const opsFeatureFlagsToProvision: Record<string, boolean> = {};

  for (const toggleKey of toggleKeys) {
    const opsToggleKey = ensureOpsPrefix(toggleKey);

    if (typeof opsFeatureToggle[opsToggleKey] !== 'boolean') {
      opsFeatureToggle[opsToggleKey] = true;
    }

    opsFeatureFlagsToProvision[opsToggleKey] = true;
  }

  const appConfigurationClient = getAppConfigClient();
  if (
    !appConfigurationClient ||
    Object.keys(opsFeatureFlagsToProvision).length === 0
  ) {
    return;
  }

  await provisionFeatureFlags(
    appConfigurationClient,
    opsFeatureFlagsToProvision
  ).catch((error) => {
    logger.debug(
      error,
      `Failed to auto-provision ${Object.keys(opsFeatureFlagsToProvision).length} OPS feature toggle(s)`
    );
  });
}

export async function ensureOpsFlagExists(toggleKey: string): Promise<void> {
  await ensureOpsFlagsExist([toggleKey]);
}

export const isEnabled = isFeatureEnabled;
