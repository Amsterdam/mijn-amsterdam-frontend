import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Klachten-thema-config';
import { KlachtenDetail } from './KlachtenDetail';
import { default as KlachtenIcon } from './KlachtenIcon.svg?react';
import { KlachtenList } from './KlachtenList';
import { KlachtenThema } from './KlachtenThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const KlachtenRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: KlachtenDetail,
    isActive: featureToggle.klachtenActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: KlachtenList,
    isActive: featureToggle.klachtenActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: KlachtenThema,
    isActive: featureToggle.klachtenActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private'],
  redactedScope: 'none',
  isActive(appState: AppState) {
    return (
      featureToggle.klachtenActive &&
      !isLoading(appState.KLACHTEN) &&
      !!appState.KLACHTEN.content?.length
    );
  },
  IconSVG: KlachtenIcon,
};
