import {
  routeConfig,
  featureToggle,
  themaId,
  themaTitle,
} from './AVG-thema-config';
import { AVGDetail } from './AVGDetail';
import { default as AvgIcon } from './AvgIcon.svg?react';
import { AVGLijst } from './AVGLijst';
import { AVGThema } from './AVGThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const AvgRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: AVGDetail,
    isActive: featureToggle.avgActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: AVGLijst,
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
