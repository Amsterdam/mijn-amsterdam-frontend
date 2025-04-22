import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Bezwaren-thema-config';
import { BezwarenDetail } from './BezwarenDetail';
import { default as BezwarenIcon } from './BezwarenIcon.svg?react';
import { BezwarenLijst } from './BezwarenLijst';
import { BezwarenThema } from './BezwarenThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const BezwarenRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: BezwarenDetail,
    isActive: featureToggle.BezwarenActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: BezwarenLijst,
    isActive: featureToggle.BezwarenActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: BezwarenThema,
    isActive: featureToggle.BezwarenActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.BezwarenActive &&
      !isLoading(appState.BEZWAREN) &&
      !!appState.BEZWAREN.content?.length
    );
  },
  IconSVG: BezwarenIcon,
};
