import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const OPS_DECOS_FEATURE_FLAG = 'OPS.DECOS';
const FEATURE_FLAG_OVERRIDE_KEY = 'AFIS.EMandates';
const FEATURE_FLAG_DEFAULT_ONLY_KEY = 'cobrowse';
const FEATURE_FLAG_CONTENT_TYPE =
  'application/vnd.microsoft.appconfig.ff+json;charset=utf-8';
const FEATURE_FLAG_PREFIX = '.appconfig.featureflag/';

function createFeatureFlagSetting(key: string, enabled: boolean) {
  return {
    key: `${FEATURE_FLAG_PREFIX}${key}`,
    contentType: FEATURE_FLAG_CONTENT_TYPE,
    value: JSON.stringify({
      id: key,
      enabled,
      conditions: {
        client_filters: [],
        requirement_type: 'Any',
      },
    }),
  };
}

const mocks = vi.hoisted(() => {
  return {
    remoteFeatureFlags: new Map<string, boolean>(),
    listConfigurationSettings: vi.fn(() => {
      return {
        async *[Symbol.asyncIterator]() {
          for (const [key, enabled] of mocks.remoteFeatureFlags.entries()) {
            yield createFeatureFlagSetting(key, enabled);
          }
        },
      };
    }),
    addConfigurationSetting: vi.fn(
      async (setting: { key: string; value: string }) => {
        const parsedFeatureFlag = JSON.parse(setting.value) as {
          id?: string;
          enabled: boolean;
        };
        const featureFlagName =
          parsedFeatureFlag.id ?? setting.key.replace(FEATURE_FLAG_PREFIX, '');

        mocks.remoteFeatureFlags.set(
          featureFlagName,
          parsedFeatureFlag.enabled
        );
        return setting;
      }
    ),
  };
});

vi.mock('@azure/app-configuration', () => {
  class AppConfigurationClientMock {
    listConfigurationSettings = mocks.listConfigurationSettings;
    addConfigurationSetting = mocks.addConfigurationSetting;

    constructor(_connectionString: string) {
      // No-op
    }
  }

  return {
    AppConfigurationClient: AppConfigurationClientMock,
    featureFlagContentType: FEATURE_FLAG_CONTENT_TYPE,
    featureFlagPrefix: FEATURE_FLAG_PREFIX,
    isFeatureFlag: (setting: { contentType?: string; value?: unknown }) =>
      setting.contentType === FEATURE_FLAG_CONTENT_TYPE &&
      typeof setting.value === 'string',
    parseFeatureFlag: (setting: { key: string; value: string }) => {
      const parsed = JSON.parse(setting.value);

      return {
        ...setting,
        value: {
          id: parsed.id,
          enabled: parsed.enabled,
          conditions: {
            clientFilters: [],
            requirementType: 'Any',
          },
        },
      };
    },
  };
});

describe('startAppConfiguration OPS behavior', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.listConfigurationSettings.mockClear();
    mocks.addConfigurationSetting.mockClear();
    mocks.remoteFeatureFlags.clear();

    vi.stubEnv('MA_OTAP_ENV', 'development');
    vi.stubEnv('BFF_SKIP_APPCONFIG', 'false');
    vi.stubEnv(
      'APPCONFIGURATION_CONNECTION_STRING',
      'Endpoint=https://example.azconfig.io;Id=id;Secret=secret'
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('ensureOpsFlagExists creates a missing OPS flag and provisions it', async () => {
    const { ensureOpsFlagExists, isOpsEnabled } =
      await import('./azure-appconfiguration.ts');
    const { opsFeatureToggle } = await import('./ops-feature-toggles.ts');

    expect(opsFeatureToggle[OPS_DECOS_FEATURE_FLAG]).toBeUndefined();

    ensureOpsFlagExists('DECOS');

    expect(opsFeatureToggle[OPS_DECOS_FEATURE_FLAG]).toBe(true);
    expect(isOpsEnabled('DECOS')).toBe(true);

    await vi.waitFor(() => {
      expect(mocks.addConfigurationSetting).toHaveBeenCalledTimes(1);
    });
    expect(mocks.remoteFeatureFlags.get(OPS_DECOS_FEATURE_FLAG)).toBe(true);
  });

  it('ensureOpsFlagExists keeps an existing OPS flag value', async () => {
    const { ensureOpsFlagExists, isOpsEnabled } =
      await import('./azure-appconfiguration.ts');
    const { opsFeatureToggle } = await import('./ops-feature-toggles.ts');

    opsFeatureToggle[OPS_DECOS_FEATURE_FLAG] = false;

    ensureOpsFlagExists('DECOS');

    expect(opsFeatureToggle[OPS_DECOS_FEATURE_FLAG]).toBe(false);
    expect(isOpsEnabled('DECOS')).toBe(false);

    await vi.waitFor(() => {
      expect(mocks.addConfigurationSetting).toHaveBeenCalledTimes(1);
    });
  });

  it('isOpsEnabled returns true when an OPS flag does not exist', async () => {
    const { isOpsEnabled } = await import('./azure-appconfiguration.ts');

    expect(isOpsEnabled('DECOS')).toBe(true);
  });

  it('isOpsEnabled supports OPS-prefixed keys', async () => {
    const { isOpsEnabled } = await import('./azure-appconfiguration.ts');
    const { opsFeatureToggle } = await import('./ops-feature-toggles.ts');

    opsFeatureToggle[OPS_DECOS_FEATURE_FLAG] = false;

    expect(isOpsEnabled(OPS_DECOS_FEATURE_FLAG)).toBe(false);
    expect(isOpsEnabled(OPS_DECOS_FEATURE_FLAG.replace('OPS.', ''))).toBe(
      false
    );
  });

  it('startAppConfiguration merges local defaults with remote feature flags', async () => {
    const appConfig = await import('./azure-appconfiguration.ts');

    mocks.remoteFeatureFlags.set(FEATURE_FLAG_OVERRIDE_KEY, false);

    await appConfig.startAppConfiguration();

    expect(appConfig.isEnabled(FEATURE_FLAG_OVERRIDE_KEY as never)).toBe(false);
    expect(appConfig.isEnabled(FEATURE_FLAG_DEFAULT_ONLY_KEY as never)).toBe(
      false
    );
  });
});

describe('forTesting.isOpsEnabled_', () => {
  let isOpsEnabledForTesting: (
    toggleKey: string,
    toggles: Record<string, boolean>
  ) => boolean;

  beforeAll(async () => {
    const { forTesting } = await import('./azure-appconfiguration.ts');
    isOpsEnabledForTesting = forTesting.isOpsEnabled_;
  });

  it('returns false when the exact key is disabled', () => {
    expect(
      isOpsEnabledForTesting('OPS.HORECA.DECOS.documents', {
        'OPS.HORECA.DECOS.documents': false,
      })
    ).toBe(false);
  });

  it('returns true when all are enabled', () => {
    expect(
      isOpsEnabledForTesting('OPS.HORECA.DECOS.documents', {
        'OPS.HORECA.DECOS.documents': true,
        'OPS.HORECA.DECOS': true,
        'OPS.HORECA': true,
      })
    ).toBe(true);
  });

  it('returns false when a parent key is disabled', () => {
    expect(
      isOpsEnabledForTesting('OPS.HORECA.DECOS.documents', {
        'OPS.HORECA.DECOS.documents': true,
        'OPS.HORECA.DECOS': true,
        'OPS.HORECA': false,
      })
    ).toBe(false);
  });

  it('returns true when missing keys are undefined and no checked key is false', () => {
    expect(
      isOpsEnabledForTesting('OPS.HORECA.DECOS.documents', {
        'OPS.HORECA.DECOS.documents': true,
      })
    ).toBe(true);
  });
});
