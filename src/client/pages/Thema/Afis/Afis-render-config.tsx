import { themaConfig } from './Afis-thema-config.ts';
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
    route: themaConfig.listPage.route.path,
    Component: AfisList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPage.route.path,
    Component: AfisFactuur,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.betaalVoorkeuren.route.path,
    Component: AfisBetaalVoorkeuren,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPageEMandate.route.path,
    Component: AfisEMandateDetail,
    isActive: themaConfig.featureToggle.emandates.active,
  },
  {
    route: themaConfig.route.path,
    Component: AfisThema,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  redactedScope: themaConfig.redactedScope,
  profileTypes: themaConfig.profileTypes,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.AFIS) &&
      !!appState.AFIS.content?.isKnown
    );
  },
  IconSVG: AfisIcon,
};
