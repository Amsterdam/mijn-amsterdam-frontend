import { Bodem } from './Bodem';
import { BodemList } from './BodemList';
import { LoodMeting } from './LoodMeting';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

export const BodemRoutes = [
  {
    route: '/bodem/lood-meting/:id',
    Component: LoodMeting,
    isActive: FeatureToggle.bodemActive,
  },
  {
    route: '/bodem/lijst/:kind/:page?',
    Component: BodemList,
    isActive: FeatureToggle.bodemActive,
  },
  {
    route: '/bodem',
    Component: Bodem,
    isActive: FeatureToggle.bodemActive,
  },
];
