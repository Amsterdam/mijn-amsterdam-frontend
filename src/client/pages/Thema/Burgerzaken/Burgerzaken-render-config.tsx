import { PassportIcon } from '@amsterdam/design-system-react-icons';

import {
  getThemaTitleBurgerzakenWithAppState,
  getThemaUrlBurgerzakenWithAppState,
} from './Burgerzaken-helpers';
import {
  routeConfig,
  themaId,
  featureToggle,
} from './Burgerzaken-thema-config';
import { BurgerzakenDetail } from './BurgerzakenDetail';
import { BurgerzakenList } from './BurgerzakenList';
import { BurgerzakenThema } from './BurgerzakenThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const BurgerzakenRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: BurgerzakenDetail,
    isActive: featureToggle.burgerzakenActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: BurgerzakenList,
    isActive: featureToggle.burgerzakenActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: BurgerzakenThema,
    isActive: featureToggle.burgerzakenActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: (appState: AppState) => {
    return getThemaTitleBurgerzakenWithAppState(appState);
  },
  id: themaId,
  redactedScope: 'content',
  to: (appState) => getThemaUrlBurgerzakenWithAppState(appState),
  profileTypes: ['private'],
  isActive(appState: AppState) {
    return (
      featureToggle.burgerzakenActive &&
      !isLoading(appState.BRP) &&
      !!appState.BRP?.content?.identiteitsbewijzen?.length
    );
  },
  IconSVG: PassportIcon,
};
