import {
  routeConfig,
  featureToggle,
  themaId,
  themaTitle,
} from './AVG-thema-config.ts';
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
    route: routeConfig.detailPage.path,
    Component: AVGDetail,
    isActive: featureToggle.avgActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: AVGList,
    isActive: featureToggle.avgActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: AVGThema,
    isActive: featureToggle.avgActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.avgActive &&
      !isLoading(appState.AVG) &&
      !!appState.AVG?.content?.verzoeken?.length
    );
  },
  IconSVG: AvgIcon,
};
