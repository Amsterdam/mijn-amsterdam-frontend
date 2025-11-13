import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Afis-thema-config';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren';
import { AfisEMandateDetail } from './AfisEMandateDetail';
import { AfisFactuur } from './AfisFactuur';
import { default as AfisIcon } from './AfisIcon.svg?react';
import { AfisList } from './AfisList';
import { AfisThema } from './AfisThema';
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
    Component: AfisFactuur,
    isActive: featureToggle.AfisActive,
  },
  {
    route: routeConfig.betaalVoorkeuren.path,
    Component: AfisBetaalVoorkeuren,
    isActive: featureToggle.AfisActive,
  },
  {
    route: routeConfig.detailPageEMandate.path,
    Component: AfisEMandateDetail,
    isActive: featureToggle.AfisActive && featureToggle.afisEMandatesActive,
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
  redactedScope: 'full',
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
