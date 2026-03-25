import { themaConfig } from './Horeca-thema-config.ts';
import { HorecaDetail } from './HorecaDetail.tsx';
import { default as HorecaIcon } from './HorecaIcon.svg?react';
import { HorecaList } from './HorecaList.tsx';
import { HorecaThema } from './HorecaThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const HorecaRoutes = [
  {
    route: themaConfig.listPage.route.path,
    Component: HorecaList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPage.route.path,
    Component: HorecaDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: HorecaThema,
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
      !isLoading(appState.HORECA) &&
      !!appState.HORECA.content?.length
    );
  },
  IconSVG: HorecaIcon,
};
