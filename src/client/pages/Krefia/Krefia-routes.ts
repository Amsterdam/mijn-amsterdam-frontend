import { KrefiaThemaPagina } from './Krefia';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

export const KrefiaRoutes = [
  {
    route: '/kredietbank-fibu',
    Component: KrefiaThemaPagina,
    isActive: FeatureToggle.krefiaActive,
  },
];
