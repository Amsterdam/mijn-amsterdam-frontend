import { Varen } from './Varen';
import { VarenDetail } from './VarenDetail';
import { VarenList } from './VarenList';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const VarenRoutes = [
  {
    route: '/passagiers-en-beroepsvaart/vergunningen/lijst/:kind/:page?',
    Component: VarenList,
    isActive: FeatureToggle.varenActive,
  },
  {
    route: '/passagiers-en-beroepsvaart/vergunning/:caseType/:id',
    Component: VarenDetail,
    isActive: FeatureToggle.varenActive,
  },
  {
    route: '/passagiers-en-beroepsvaart',
    Component: Varen,
    isActive: FeatureToggle.varenActive,
  },
];
