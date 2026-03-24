import { themaConfig } from './Klachten-thema-config.ts';
import { KlachtenDetail } from './KlachtenDetail.tsx';
import { default as KlachtenIcon } from './KlachtenIcon.svg?react';
import { KlachtenList } from './KlachtenList.tsx';
import { KlachtenThema } from './KlachtenThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const KlachtenRoutes = [
  {
    route: themaConfig.route.path,
    Component: KlachtenThema,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: KlachtenList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPage.route.path,
    Component: KlachtenDetail,
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
      !isLoading(appState.KLACHTEN) &&
      !!appState.KLACHTEN.content?.length
    );
  },
  IconSVG: KlachtenIcon,
};
