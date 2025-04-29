import { IS_PRODUCTION } from '../../../../universal/config/env';

export const SVWI_ROUTE_DEFAULT = 'https://mijn.werkeninkomen.amsterdam.nl';

export const featureToggle = {
  svwiActive: !IS_PRODUCTION,
};

export const themaId = 'SVWI' as const;
export const themaTitle = 'Inkomen portaal';
