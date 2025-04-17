import { InkomenThemaPagina } from './Inkomen';
import { isInkomenThemaActive } from './Inkomen-helpers';
import { routes, themaId, themaTitle } from './Inkomen-thema-config';
import { InkomenDetailBbz } from './InkomenDetailBbz';
import { InkomenDetailTonk } from './InkomenDetailTonk';
import { InkomenDetailTozo } from './InkomenDetailTozo';
import { InkomenDetailUitkering } from './InkomenDetailUitkering';
import { InkomenLijstPagina } from './InkomenListPage';
import { InkomenSpecificaties } from './InkomenSpecificaties';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { IconInkomen } from '../../assets/icons';
import { ThemaMenuItem } from '../../config/thema-types';

export const InkomenRoutes = [
  { route: routes.detailPageTozo, Component: InkomenDetailTozo },
  { route: routes.detailPageTonk, Component: InkomenDetailTonk },
  {
    route: routes.listPageSpecificaties,
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

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routes.themaPage,
  profileTypes: ['private'],
  isActive: isInkomenThemaActive,
  IconSVG: IconInkomen,
};
