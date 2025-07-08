import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Bezwaren-thema-config.ts';
import { BezwarenDetail } from './BezwarenDetail.tsx';
import { default as BezwarenIcon } from './BezwarenIcon.svg?react';
import { BezwarenList } from './BezwarenList.tsx';
import { BezwarenThema } from './BezwarenThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const BezwarenRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: BezwarenDetail,
    isActive: featureToggle.BezwarenActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: BezwarenList,
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
