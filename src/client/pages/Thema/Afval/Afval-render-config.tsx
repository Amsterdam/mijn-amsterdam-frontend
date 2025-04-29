import {
  featureToggle,
  routeConfig,
  themaId,
  themaTitle,
} from './Afval-thema-config';
import { default as AfvalIcon } from './AfvalIcon.svg?react';
import { AfvalThemaPagina } from './AfvalThema';
import { isLoading } from '../../../../universal/helpers/api';
import { isMokum } from '../../../../universal/helpers/brp';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const AfvalRoutes = [
  {
    route: routeConfig.themaPage.path,
    Component: AfvalThemaPagina,
    isActive: featureToggle.AfvalActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.AfvalActive &&
      !isLoading(appState.AFVAL) &&
      !isLoading(appState.MY_LOCATION) &&
      isMokum(appState.BRP?.content) &&
      !!appState.AFVAL.content?.length
    );
  },
  IconSVG: AfvalIcon,
};
