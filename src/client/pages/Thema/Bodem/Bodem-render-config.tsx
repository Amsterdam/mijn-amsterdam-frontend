import { routeConfig, featureToggle, themaConfig } from './Bodem-thema-config';
import { BodemDetail } from './BodemDetail';
import { default as BodemIcon } from './BodemIcon.svg?react';
import { BodemList } from './BodemList';
import { BodemThema } from './BodemThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const BodemRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: BodemDetail,
    isActive: themaConfig.featureToggle,
  },
  {
    route: routeConfig.listPage.path,
    Component: BodemList,
    isActive: themaConfig.featureToggle,
  },
  {
    route: routeConfig.themaPage.path,
    Component: BodemThema,
    isActive: themaConfig.featureToggle,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  isActive(appState: AppState) {
    return (
      featureToggle.BodemActive &&
      !isLoading(appState.BODEM) &&
      !!appState.BODEM.content?.length
    );
  },
  IconSVG: BodemIcon,
};
