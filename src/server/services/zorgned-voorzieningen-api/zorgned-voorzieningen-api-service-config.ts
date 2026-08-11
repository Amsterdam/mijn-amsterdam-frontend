import { isEnabled } from '../../config/azure-appconfiguration.ts';

export const featureToggle = {
  router: {
    private: {
      isEnabled: true,
    },
  },
  service: {
    fetchWmo: {
      addMaVoorzieningenApiProps: isEnabled(
        'WMO.fetchWmo.addMaVoorzieningenApiProps'
      ),
    },
  },
} as const;

// The role is generic and not specific to WMO, because the same role is used for all ZorgNed voorzieningen clients (WMO, LLV, HLI).
export const OAUTH_ROLE_ZORGNED_VOORZIENINGEN = 'wmo.voorzieningen' as const;

export const routes = {
  private: {
    VOORZIENINGEN: `/services/zorgned/voorzieningen`,
    VOORZIENING_DETAIL: `/services/zorgned/voorziening`,
  },
} as const;
