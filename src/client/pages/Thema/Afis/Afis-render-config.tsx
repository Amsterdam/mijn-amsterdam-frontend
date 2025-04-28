import { AfisThema } from './AfisThema';
import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Afis-thema-config';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren';
import { AfisList } from './AfisList';
import { default as AfisIcon } from './AfisIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const AfisRoutes = [
  {
    route: routeConfig.listPage.path,
    Component: AfisList,
    isActive: featureToggle.AfisActive,
  },
  {
    route: routeConfig.detailPage.path,
    Component: AfisBetaalVoorkeuren,
    isActive: featureToggle.AfisActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: AfisThema,
    isActive: featureToggle.AfisActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.AfisActive &&
      !isLoading(appState.AFIS) &&
      !!appState.AFIS.content?.isKnown
    );
  },
  IconSVG: AfisIcon,
};
