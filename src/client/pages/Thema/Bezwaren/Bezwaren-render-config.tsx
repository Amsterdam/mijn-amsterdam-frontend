import { routeConfig, themaConfig } from './Bezwaren-thema-config';
import { BezwarenDetail } from './BezwarenDetail';
import { default as BezwarenIcon } from './BezwarenIcon.svg?react';
import { BezwarenList } from './BezwarenList';
import { BezwarenThema } from './BezwarenThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const BezwarenRoutes = [
  {
    route: themaConfig.detailPage.route.path,
    Component: BezwarenDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.listPage.path,
    Component: BezwarenList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: BezwarenThema,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  redactedScope: themaConfig.redactedScope,
  profileTypes: themaConfig.profileTypes,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.BEZWAREN) &&
      !!appState.BEZWAREN.content?.length
    );
  },
  IconSVG: BezwarenIcon,
};
