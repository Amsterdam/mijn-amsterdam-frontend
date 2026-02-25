import { routeConfig, themaConfig } from './Horeca-thema-config';
import { HorecaDetail } from './HorecaDetail';
import { default as HorecaIcon } from './HorecaIcon.svg?react';
import { HorecaList } from './HorecaList';
import { HorecaThema } from './HorecaThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const HorecaRoutes = [
  {
    route: themaConfig.listPage.route.path,
    Component: HorecaList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.detailPage.path,
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
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.HORECA) &&
      !!appState.HORECA.content?.length
    );
  },
  IconSVG: HorecaIcon,
};
