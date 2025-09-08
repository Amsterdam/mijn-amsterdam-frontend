import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
  profileTypes, // readonly array uit thema-config
} from './Bodem-thema-config';
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
// Routes (frontend-specifiek, React componenten)
// -----------------------------
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

// -----------------------------
// Menu-item configuratie
// profileTypes komt nu uit thema-config
// Ik hebvan readonly array een gewone array gemaakt met [...]
// IconSVG blijft frontend-specifiek
// -----------------------------
export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: profileTypes, // fix: readonly -> mutable
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
