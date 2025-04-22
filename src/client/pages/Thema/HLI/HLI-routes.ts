import { HLIDetail } from './HLIDetail';
import { HLIList } from './HLIList';
import { HLIStadspasDetail } from './HLIStadspasDetail';
import { HLIThema } from './HLIThema';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const HLIRoutes = [
  {
    route: '/regelingen-bij-laag-inkomen/stadspas/:passNumber',
    Component: HLIStadspasDetail,
    isActive: FeatureToggle.hliThemaStadspasActive,
  },
  {
    route: '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
    Component: HLIDetail,
    isActive: FeatureToggle.hliThemaRegelingenActive,
  },
  {
    route: '/regelingen-bij-laag-inkomen/lijst/:kind/:page?',
    Component: HLIList,
    isActive: FeatureToggle.hliThemaRegelingenActive,
  },
  {
    route: '/regelingen-bij-laag-inkomen',
    Component: HLIThema,
    isActive: FeatureToggle.hliThemaActive,
  },
];
