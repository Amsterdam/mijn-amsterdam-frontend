import { routeConfig, themaConfig, featureToggle } from './Horeca-thema-config';
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
    route: routeConfig.listPage.path,
    Component: HorecaList,
    isActive: featureToggle.horecaActive,
  },
  {
    route: routeConfig.detailPage.path,
    Component: HorecaDetail,
    isActive: featureToggle.horecaActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: HorecaThema,
    isActive: featureToggle.horecaActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  isActive(appState: AppState) {
    return (
      featureToggle.horecaActive &&
      !isLoading(appState.HORECA) &&
      !!appState.HORECA.content?.length
    );
  },
  IconSVG: HorecaIcon,
};
