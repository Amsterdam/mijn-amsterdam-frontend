import { InkomenThemaPagina } from './Inkomen';
import { isInkomenThemaActive } from './Inkomen-helpers';
import { routeConfig, themaId, themaTitle } from './Inkomen-thema-config';
import { InkomenDetailBbz } from './InkomenDetailBbz';
import { InkomenDetailTonk } from './InkomenDetailTonk';
import { InkomenDetailTozo } from './InkomenDetailTozo';
import { InkomenDetailUitkering } from './InkomenDetailUitkering';
import { default as InkomenIcon } from './InkomenIcon.svg?react';
import { InkomenLijstPagina } from './InkomenListPage';
import { InkomenSpecificaties } from './InkomenSpecificaties';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const InkomenRoutes = [
  {
    route: routeConfig.detailPageTozo.path,
    Component: InkomenDetailTozo,
  },
  {
    route: routeConfig.detailPageTonk.path,
    Component: InkomenDetailTonk,
  },
  {
    route: routeConfig.listPageSpecificaties.path,
    Component: InkomenSpecificaties,
  },
  {
    route: routeConfig.detailPageUitkering.path,
    Component: InkomenDetailUitkering,
  },
  {
    route: routeConfig.detailPageBbz.path,
    Component: InkomenDetailBbz,
    isActive: FeatureToggle.inkomenBBZActive,
  },
  { route: routeConfig.listPage.path, Component: InkomenLijstPagina },
  { route: routeConfig.themaPage.path, Component: InkomenThemaPagina },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private'],
  isActive: isInkomenThemaActive,
  IconSVG: InkomenIcon,
};
