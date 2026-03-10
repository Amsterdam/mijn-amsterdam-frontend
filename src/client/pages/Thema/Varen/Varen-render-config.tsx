import { themaConfig, routeConfig } from './Varen-thema-config';
import { VarenDetailPageContentExploitatieVergunning } from './VarenDetailVergunningExploitatie';
import { VarenDetailPageContentExploitatieZaak } from './VarenDetailZaakExploitatie';
import { default as VarenIcon } from './VarenIcon.svg?react';
import { VarenList } from './VarenList';
import { VarenThema } from './VarenThema';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const VarenRoutes = [
  {
    route: routeConfig.detailPageZaak.path,
    Component: VarenDetailPageContentExploitatieZaak,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.detailPageVergunning.path,
    Component: VarenDetailPageContentExploitatieVergunning,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.listPage.path,
    Component: VarenList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: VarenThema,
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
      !isLoading(appState.VAREN) &&
      (!!appState.VAREN?.content?.reder ||
        !!appState.VAREN?.content?.zaken?.length ||
        !!appState.VAREN?.content?.vergunningen?.length) &&
      themaConfig.featureToggle.active
    );
  },
  IconSVG: VarenIcon,
};
