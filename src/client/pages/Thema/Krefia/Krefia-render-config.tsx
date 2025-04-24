import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Krefia-thema-config';
import { default as KrefiaIcon } from './KrefiaIcon.svg?react';
import { KrefiaThema } from './KrefiaThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const KrefiaRoutes = [
  {
    route: routeConfig.themaPage.path,
    Component: KrefiaThema,
    isActive: featureToggle.krefiaActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private'],
  isActive(appState: AppState) {
    return (
      featureToggle.krefiaActive &&
      !isLoading(appState.KREFIA) &&
      !!appState.KREFIA.content?.deepLinks.length
    );
  },
  IconSVG: KrefiaIcon,
};
