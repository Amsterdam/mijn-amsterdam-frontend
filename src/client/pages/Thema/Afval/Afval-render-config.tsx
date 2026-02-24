import { featureToggle, themaConfig } from './Afval-thema-config';
import { default as AfvalIcon } from './AfvalIcon.svg?react';
import { AfvalThemaPagina } from './AfvalThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const AfvalRoutes = [
  {
    route: themaConfig.route.path,
    Component: AfvalThemaPagina,
    isActive: featureToggle.AfvalActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    return !!(
      featureToggle.AfvalActive &&
      !isLoading(appState.AFVAL) &&
      !isLoading(appState.MY_LOCATION) &&
      appState.MY_LOCATION.content?.some((location) => location.mokum) &&
      appState.AFVAL.content?.length
    );
  },
  IconSVG: AfvalIcon,
};
