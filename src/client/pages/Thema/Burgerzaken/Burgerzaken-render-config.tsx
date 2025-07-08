import { PassportIcon } from '@amsterdam/design-system-react-icons';

import {
  getThemaTitleBurgerzakenWithAppState,
  getThemaUrlBurgerzakenWithAppState,
} from './Burgerzaken-helpers.ts';
import {
  routeConfig,
  themaId,
  featureToggle,
} from './Burgerzaken-thema-config.ts';
import { BurgerzakenDetail } from './BurgerzakenDetail.tsx';
import { BurgerzakenList } from './BurgerzakenList.tsx';
import { BurgerzakenThema } from './BurgerzakenThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

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
