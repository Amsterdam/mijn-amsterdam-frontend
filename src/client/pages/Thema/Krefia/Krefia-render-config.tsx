import { themaConfig } from './Krefia-thema-config.ts';
import { default as KrefiaIcon } from './KrefiaIcon.svg?react';
import { KrefiaThema } from './KrefiaThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const KrefiaRoutes = [
  {
    route: themaConfig.route.path,
    Component: KrefiaThema,
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
      !isLoading(appState.KREFIA) &&
      !!appState.KREFIA.content?.deepLinks.length
    );
  },
  IconSVG: KrefiaIcon,
};
