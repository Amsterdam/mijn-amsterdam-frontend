import { isEnabled } from '../../config/azure-appconfiguration.ts';

export const featureToggle = {
  router: {
    private: {
      isEnabled: true,
    },
  },
  service: {
    fetchWmo: {
      addMaAanvragenApiProps: isEnabled(
        'WMO.fetchWmo.addMaVoorzieningenApiProps'
      ),
    },
  },
} as const;

// The role is generic and not specific to WMO, because the same role is used for all ZorgNed aanvragen clients (WMO, LLV, HLI).
export const OAUTH_ROLE_ZORGNED_AANVRAGEN = 'wmo.aanvragen' as const;

export const routes = {
  private: {
    VOORZIENINGEN_JZD: `/services/jzd/voorzieningen`,
    AANVRAGEN: `/services/zorgned/aanvragen`,
    AANVRAAG_DETAIL: `/services/zorgned/aanvraag`,
  },
} as const;
