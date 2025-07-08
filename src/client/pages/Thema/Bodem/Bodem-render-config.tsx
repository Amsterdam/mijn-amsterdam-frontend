import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Bodem-thema-config.ts';
import { default as BodemIcon } from './BodemIcon.svg?react';
import { BodemList } from './BodemList.tsx';
import { BodemThema } from './BodemThema.tsx';
import { BodemDetail } from './BodemDetail.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const BodemRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: BodemDetail,
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
