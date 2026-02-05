import { routeConfig, themaConfig } from './AVG-thema-config';
import { AVGDetail } from './AVGDetail';
import { default as AvgIcon } from './AvgIcon.svg?react';
import { AVGList } from './AVGList';
import { AVGThema } from './AVGThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const AvgRoutes = [
  {
    route: themaConfig.detailPage.route.path,
    Component: AVGDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.listPage.path,
    Component: AVGList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: AVGThema,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.AVG) &&
      !!appState.AVG?.content?.verzoeken?.length
    );
  },
  IconSVG: AvgIcon,
};
