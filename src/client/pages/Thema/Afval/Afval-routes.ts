import { AfvalInformation } from './Afval';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const AfvalRoutes = [
  {
    route: '/afval',
    Component: AfvalInformation,
    isActive: FeatureToggle.garbageInformationPage,
  },
];
