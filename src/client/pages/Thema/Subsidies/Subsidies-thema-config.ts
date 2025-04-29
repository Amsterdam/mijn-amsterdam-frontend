
import { IS_PRODUCTION } from '../../../../universal/config/env';

export const SUBSIDIES_ROUTE_DEFAULT = 'https://subsidies.amsterdam.nl';


export const featureToggle = {
  subsidiesActive: !IS_PRODUCTION,
};

export const themaId = 'SUBSIDIES' as const;
export const themaTitle = 'Subsidies';

