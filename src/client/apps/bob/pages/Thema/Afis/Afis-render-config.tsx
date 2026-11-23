import { Navigate } from 'react-router';

import type {
  ThemaMenuItem,
  ThemaRenderRouteConfig,
} from '../../../../../../universal/types/thema-types.ts';
import { isLoading } from '../../../../../helpers/api.ts';
import { afisAccountRoutePatterns, themaConfig } from './Afis-thema-config.ts';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren.tsx';
import { AfisEMandateDetail } from './AfisEMandateDetail.tsx';
import { AfisFactuur } from './AfisFactuur.tsx';
import { default as AfisIcon } from './AfisIcon.svg?react';
import { AfisList } from './AfisList.tsx';
import { AfisThema } from './AfisThema.tsx';

export const AfisRoutes = [
  {
    route: afisAccountRoutePatterns.overview,
    Component: AfisThema,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: afisAccountRoutePatterns.listPage,
    Component: AfisList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: afisAccountRoutePatterns.detailPage,
    Component: AfisFactuur,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: afisAccountRoutePatterns.betaalVoorkeuren,
    Component: AfisBetaalVoorkeuren,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: afisAccountRoutePatterns.eMandate,
    Component: AfisEMandateDetail,
    isActive: themaConfig.featureToggle.emandates.active,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: () => <Navigate to={themaConfig.route.path} replace />,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPage.route.path,
    Component: () => <Navigate to={themaConfig.route.path} replace />,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPageBetaalvoorkeuren.route.path,
    Component: () => <Navigate to={themaConfig.route.path} replace />,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPageEMandate.route.path,
    Component: () => <Navigate to={themaConfig.route.path} replace />,
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
  isActive(appState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.AFIS) &&
      !!appState.AFIS?.content?.isKnown
    );
  },
  IconSVG: AfisIcon,
};
