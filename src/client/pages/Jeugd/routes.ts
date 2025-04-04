import { JeugdDetail } from './JeugdDetail';
import { JeugdThemaPagina } from './JeugdThema';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

const baseRoute = '/jeugd';

export const JeugdRoutes = [
  {
    route: baseRoute,
    Component: JeugdThemaPagina,
    isActive: FeatureToggle.zorgnedLeerlingenvervoerActive,
  },
  {
    route: `${baseRoute}/voorziening/:id`,
    Component: JeugdDetail,
    isActive: FeatureToggle.zorgnedLeerlingenvervoerActive,
  },
];
