import { BezwarenThemaPagina } from './Bezwaren';
import { BezwarenDetailPagina } from './BezwarenDetail';
import { BezwarenLijstPagina } from './BezwarenLijst';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const BezwarenRoutes = [
  {
    route: '/bezwaren/lijst/:kind/:page?',
    Component: BezwarenLijstPagina,
    isActive: FeatureToggle.bezwarenActive,
  },
  {
    route: '/bezwaren/:uuid',
    Component: BezwarenDetailPagina,
    isActive: FeatureToggle.bezwarenActive,
  },
  {
    route: '/bezwaren',
    Component: BezwarenThemaPagina,
    isActive: FeatureToggle.bezwarenActive,
  },
];
