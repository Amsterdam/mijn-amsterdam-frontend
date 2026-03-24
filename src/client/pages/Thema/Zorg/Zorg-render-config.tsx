import { themaConfig } from './Zorg-thema-config.ts';
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
    route: themaConfig.detailPage.route.path,
    Component: ZorgDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: ZorgList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: ZorgThema,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.WMO) &&
      !!appState.WMO.content?.length
    );
  },
  IconSVG: ZorgIcon,
};
