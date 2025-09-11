import { routeConfig, themaConfig } from './Bodem-thema-config';
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

// -----------------------------
// Routes (frontend React-components)
// -----------------------------
export const BodemRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: BodemDetail,
    isActive: themaConfig.featureToggle.BodemActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: BodemList,
    isActive: themaConfig.featureToggle.BodemActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: BodemThema,
    isActive: themaConfig.featureToggle.BodemActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

// -----------------------------
// Menu-item configuratie (frontend)
// -----------------------------
export const menuItem: ThemaMenuItem<typeof themaConfig.id> = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: routeConfig.themaPage.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: 'none',
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.BodemActive &&
      !isLoading(appState.BODEM) &&
      !!appState.BODEM.content?.length
    );
  },
  IconSVG: BodemIcon,
};
