import { themaConfig } from './ToeristischeVerhuur-thema-config.ts';
import { ToeristischeVerhuurDetail } from './ToeristischeVerhuurDetail.tsx';
import { default as ToeristischeVerhuurIcon } from './ToeristischeVerhuurIcon.svg?react';
import { ToeristischeVerhuurList } from './ToeristischeVerhuurList.tsx';
import { ToeristischeVerhuurThema } from './ToeristischeVerhuurThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const ToeristischeVerhuurRoutes = [
  {
    route: themaConfig.detailPage.route.path,
    Component: ToeristischeVerhuurDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: ToeristischeVerhuurList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: ToeristischeVerhuurThema,
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
    const { lvvRegistraties, vakantieverhuurVergunningen, bbVergunningen } =
      appState.TOERISTISCHE_VERHUUR?.content ?? {};
    const hasRegistraties = !!lvvRegistraties?.length;
    const hasVergunningen =
      !!vakantieverhuurVergunningen?.length || !!bbVergunningen?.length;

    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.TOERISTISCHE_VERHUUR) &&
      (hasRegistraties || hasVergunningen)
    );
  },
  IconSVG: ToeristischeVerhuurIcon,
};
