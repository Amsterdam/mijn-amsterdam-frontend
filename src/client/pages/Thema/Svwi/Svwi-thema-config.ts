import { IS_ACCEPTANCE } from '../../../../universal/config/env';

export const SVWI_ROUTE_DEFAULT = 'https://mijn.werkeninkomen.amsterdam.nl';

export const featureToggle = {
  svwiActive: IS_ACCEPTANCE, // Only TMA connected envs can use this.
};

export const themaId = 'SVWI' as const;
export const themaTitle = 'Werk & inkomen';
