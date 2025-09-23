import { themaConfig } from './Bodem-thema-config';
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
    route: themaConfig.detailPage.route.path,
    Component: BodemDetail,
    isActive: themaConfig.featureToggle.themaActive,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: BodemList,
    isActive: themaConfig.featureToggle.themaActive,
  },
  {
    route: themaConfig.route.path,
    Component: BodemThema,
    isActive: themaConfig.featureToggle.themaActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

// -----------------------------
// Menu-item configuratie (frontend)
// -----------------------------
export const menuItem: ThemaMenuItem<typeof themaConfig.id> = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: 'none',
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.themaActive &&
      !isLoading(appState.BODEM) &&
      !!appState.BODEM.content?.length
    );
  },
  IconSVG: BodemIcon,
};
