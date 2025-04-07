import { InkomenThemaPagina } from './Inkomen';
import { routes } from './Inkomen-thema-config';
import { InkomenDetailBbz } from './InkomenDetailBbz';
import { InkomenDetailTonk } from './InkomenDetailTonk';
import { InkomenDetailTozo } from './InkomenDetailTozo';
import { InkomenDetailUitkering } from './InkomenDetailUitkering';
import { InkomenLijstPagina } from './InkomenListPage';
import { InkomenSpecificaties } from './InkomenSpecificaties';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

export const InkomenRoutes = [
  { route: routes.detailPageTozo, Component: InkomenDetailTozo },
  { route: routes.detailPageTonk, Component: InkomenDetailTonk },
  {
    route: [routes.listPageSpecificaties, routes.listPageJaaropgaven],
    Component: InkomenSpecificaties,
  },
  {
    route: routes.detailPageUitkering,
    Component: InkomenDetailUitkering,
  },
  {
    route: routes.detailPageBbz,
    Component: InkomenDetailBbz,
    isActive: FeatureToggle.inkomenBBZActive,
  },
  { route: routes.listPage, Component: InkomenLijstPagina },
  { route: routes.themaPage, Component: InkomenThemaPagina },
];
