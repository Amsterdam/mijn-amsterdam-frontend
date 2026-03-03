import { CarIcon } from '@amsterdam/design-system-react-icons';

import { themaConfig } from './Parkeren-thema-config';
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
    route: themaConfig.detailPage.route.path,
    Component: ParkerenDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: ParkerenList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: ParkerenThema,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: (appState: AppState) => {
    const hasDecosParkeerVergunningen =
      !!appState.PARKEREN?.content?.vergunningen?.length;
    const urlExternal = appState.PARKEREN?.content?.url ?? '/';
    return hasDecosParkeerVergunningen ? themaConfig.route.path : urlExternal;
  },
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    const hasDecosParkeerVergunningen =
      !!appState.PARKEREN?.content?.vergunningen?.length;
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.PARKEREN) &&
      (!!appState.PARKEREN?.content?.isKnown || hasDecosParkeerVergunningen)
    );
  },
  IconSVG: CarIcon,
};
