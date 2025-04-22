import { AfisThemaPagina } from './Afis';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren';
import { AfisFacturen } from './AfisFacturen';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const AfisRoutes = [
  {
    route: '/facturen-en-betalen/facturen/lijst/:state/:page?',
    Component: AfisFacturen,
    isActive: FeatureToggle.afisActive,
  },
  {
    route: '/facturen-en-betalen/betaalvoorkeuren',
    Component: AfisBetaalVoorkeuren,
    isActive: FeatureToggle.afisActive,
  },
  {
    route: '/facturen-en-betalen',
    Component: AfisThemaPagina,
    isActive: FeatureToggle.afisActive,
  },
];
