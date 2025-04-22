import { HLIRegeling } from './HLIRegeling';
import { HLIRegelingen } from './HLIRegelingen';
import { HLIStadspasDetail } from './HLIStadspasDetail';
import { HLIThemaPagina } from './HLIThemaPagina';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const HLIRoutes = [
  {
    route: '/regelingen-bij-laag-inkomen/stadspas/:passNumber',
    Component: HLIStadspasDetail,
    isActive: FeatureToggle.hliThemaStadspasActive,
  },
  {
    route: '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
    Component: HLIRegeling,
    isActive: FeatureToggle.hliThemaRegelingenActive,
  },
  {
    route: '/regelingen-bij-laag-inkomen/lijst/:kind/:page?',
    Component: HLIRegelingen,
    isActive: FeatureToggle.hliThemaRegelingenActive,
  },
  {
    route: '/regelingen-bij-laag-inkomen',
    Component: HLIThemaPagina,
    isActive: FeatureToggle.hliThemaActive,
  },
];
