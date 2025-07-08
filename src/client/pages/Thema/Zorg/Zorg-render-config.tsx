import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Zorg-thema-config.ts';
import { ZorgDetail } from './ZorgDetail.tsx';
import { default as ZorgIcon } from './ZorgIcon.svg?react';
import { ZorgList } from './ZorgList.tsx';
import { ZorgThema } from './ZorgThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const ZorgRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: ZorgDetail,
    isActive: featureToggle.zorgActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: ZorgList,
    isActive: featureToggle.zorgActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: ZorgThema,
    isActive: featureToggle.zorgActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private'],
  isActive(appState: AppState) {
    return (
      featureToggle.zorgActive &&
      !isLoading(appState.WMO) &&
      !!appState.WMO.content?.length
    );
  },
  IconSVG: ZorgIcon,
};
