import { IS_PRODUCTION } from '../../../universal/config/env.ts';

export const featureToggle = {
  newTipsDesign: !IS_PRODUCTION,
};
