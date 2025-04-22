import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Bodem-thema-config';
import { default as BodemIcon } from './BodemIcon.svg?react';
import { BodemList } from './BodemList';
import { BodemThema } from './BodemThema';
import { LoodMeting } from './LoodMeting';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const BodemRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: LoodMeting,
    isActive: featureToggle.BodemActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: BodemList,
    isActive: featureToggle.BodemActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: BodemThema,
    isActive: featureToggle.BodemActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.BodemActive &&
      !isLoading(appState.BODEM) &&
      !!appState.BODEM.content?.length
    );
  },
  IconSVG: BodemIcon,
};
