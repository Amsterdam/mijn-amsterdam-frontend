import { isEnabled } from '../../config/azure-appconfiguration.ts';

// The role is generic and not specific to WMO, because the same role is used for all ZorgNed aanvragen clients (WMO, LLV, HLI).
export const OAUTH_ROLE_ZORGNED_AANVRAGEN = 'wmo.aanvragen' as const;

export const featureToggle = {
  router: {
    private: {
      isEnabled: isEnabled('ZORGNED_AANVRAGEN_API.router.private'),
    },
  },
} as const;

export const routes = {
  private: {
    VOORZIENINGEN_JZD: `/services/jzd/voorzieningen`, // Legacy route definition. Used by Forms team.
    AANVRAGEN: `/services/zorgned/aanvragen`,
    AANVRAAG_DETAIL: `/services/zorgned/aanvraag`,
  },
} as const;
