import { routeConfig, themaConfig } from './ToeristischeVerhuur-thema-config';
import { ToeristischeVerhuurDetail } from './ToeristischeVerhuurDetail';
import { default as ToeristischeVerhuurIcon } from './ToeristischeVerhuurIcon.svg?react';
import { ToeristischeVerhuurList } from './ToeristischeVerhuurList';
import { ToeristischeVerhuurThema } from './ToeristischeVerhuurThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const ToeristischeVerhuurRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: ToeristischeVerhuurDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.listPage.path,
    Component: ToeristischeVerhuurList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.themaPage.path,
    Component: ToeristischeVerhuurThema,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: routeConfig.themaPage.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: 'none',
  isActive(appState: AppState) {
    const { lvvRegistraties, vakantieverhuurVergunningen, bbVergunningen } =
      appState.TOERISTISCHE_VERHUUR?.content ?? {};
    const hasRegistraties = !!lvvRegistraties?.length;
    const hasVergunningen =
      !!vakantieverhuurVergunningen?.length || !!bbVergunningen?.length;

    return (
      !isLoading(appState.TOERISTISCHE_VERHUUR) &&
      (hasRegistraties || hasVergunningen)
    );
  },
  IconSVG: ToeristischeVerhuurIcon,
};
