// The role is generic and not specific to WMO, because the same role is used for all ZorgNed aanvragen clients (WMO, LLV, HLI).
export const OAUTH_ROLE_ZORGNED_AANVRAGEN = 'wmo.aanvragen' as const;

export const routes = {
  private: {
    // Legacy route definition. Used by Forms team.
    VOORZIENINGEN_JZD: `/services/jzd/voorzieningen`,
    AANVRAGEN: `/services/zorgned/aanvragen`,
    AANVRAAG_DETAIL: `/services/zorgned/aanvraag`,
  },
} as const;
