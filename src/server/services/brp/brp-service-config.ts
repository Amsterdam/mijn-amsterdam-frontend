import { IS_PRODUCTION } from '../../../universal/config/env';

export const featureToggle = {
  router: {
    protected: {
      isEnabled: !IS_PRODUCTION, // for now only enabled in non-prod environments
    },
  },
} as const;

export const routes = {
  protected: {
    BRP_PERSONEN_RAW: `/services/brp/personen/raw`,
    BRP_VERBLIJFPLAATSHISTORIE_RAW: `/services/brp/verblijfplaatshistorie/raw`,
  },
} as const;
