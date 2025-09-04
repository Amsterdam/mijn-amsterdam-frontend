import { CarIcon } from '@amsterdam/design-system-react-icons';

import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Parkeren-thema-config';
import { ParkerenDetail } from './ParkerenDetail';
import { ParkerenList } from './ParkerenList';
import { ParkerenThema } from './ParkerenThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const ParkerenRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: ParkerenDetail,
    isActive: featureToggle.parkerenActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: ParkerenList,
    isActive: featureToggle.parkerenActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: ParkerenThema,
    isActive: featureToggle.parkerenActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: (appState: AppState) => {
    const hasDecosParkeerVergunningen =
      !!appState.PARKEREN?.content?.vergunningen?.length;
    const urlExternal = appState.PARKEREN?.content?.url ?? '/';
    return hasDecosParkeerVergunningen
      ? routeConfig.themaPage.path
      : urlExternal;
  },
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  isActive(appState: AppState) {
    const hasDecosParkeerVergunningen =
      !!appState.PARKEREN?.content?.vergunningen?.length;
    return (
      featureToggle.parkerenActive &&
      !isLoading(appState.PARKEREN) &&
      (!!appState.PARKEREN?.content?.isKnown || hasDecosParkeerVergunningen)
    );
  },
  IconSVG: CarIcon,
};
