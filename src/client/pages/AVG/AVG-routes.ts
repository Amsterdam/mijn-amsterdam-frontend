import { AVG } from './AVG';
import { AVGDetail } from './AVGDetail';
import { AVGList } from './AVGLijst';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

export const AVGRoutes = [
  {
    route: '/avg/verzoek/:id',
    Component: AVGDetail,
    isActive: FeatureToggle.avgActive,
  },
  {
    route: '/avg/lijst/:kind/:page?',
    Component: AVGList,
    isActive: FeatureToggle.avgActive,
  },
  { route: '/avg', Component: AVG, isActive: FeatureToggle.avgActive },
];
