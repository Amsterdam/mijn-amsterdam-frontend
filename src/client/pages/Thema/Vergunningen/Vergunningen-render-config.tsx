import {
  routeConfig,
  featureToggle,
  themaConfig,
} from './Vergunningen-thema-config';
import { VergunningenDetail } from './VergunningenDetail';
import { default as VergunningenIcon } from './VergunningenIcon.svg?react';
import { VergunningenList } from './VergunningenList';
import { VergunningenThema } from './VergunningenThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const VergunningenRoutes = [
  {
    route: routeConfig.detailPage.path,
    Component: VergunningenDetail,
    isActive: featureToggle.vergunningenActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: VergunningenList,
    isActive: featureToggle.vergunningenActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: VergunningenThema,
    isActive: featureToggle.vergunningenActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: routeConfig.themaPage.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    return (
      featureToggle.vergunningenActive &&
      !isLoading(appState.VERGUNNINGEN) &&
      !!appState.VERGUNNINGEN.content?.length
    );
  },
  IconSVG: VergunningenIcon,
};
