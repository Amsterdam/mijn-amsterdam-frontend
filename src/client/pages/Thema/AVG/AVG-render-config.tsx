import { themaConfig } from './AVG-thema-config.ts';
import { AVGDetail } from './AVGDetail.tsx';
import { default as AvgIcon } from './AvgIcon.svg?react';
import { AVGList } from './AVGList.tsx';
import { AVGThema } from './AVGThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const AvgRoutes = [
  {
    route: themaConfig.detailPage.route.path,
    Component: AVGDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
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
