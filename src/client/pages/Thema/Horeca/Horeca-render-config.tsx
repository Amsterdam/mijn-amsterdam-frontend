import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Horeca-thema-config.ts';
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

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.horecaActive &&
      !isLoading(appState.HORECA) &&
      !!appState.HORECA.content?.length
    );
  },
  IconSVG: HorecaIcon,
};
