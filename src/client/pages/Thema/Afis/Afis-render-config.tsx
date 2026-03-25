import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Afis-thema-config.ts';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren.tsx';
import { AfisEMandateDetail } from './AfisEMandateDetail.tsx';
import { AfisFactuur } from './AfisFactuur.tsx';
import { default as AfisIcon } from './AfisIcon.svg?react';
import { AfisList } from './AfisList.tsx';
import { AfisThema } from './AfisThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

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
    isActive: featureToggle.emandatesActive,
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
