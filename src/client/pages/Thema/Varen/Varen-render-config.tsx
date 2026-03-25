import { themaConfig } from './Varen-thema-config.ts';
import { VarenDetailPageContentExploitatieVergunning } from './VarenDetailVergunningExploitatie.tsx';
import { VarenDetailPageContentExploitatieZaak } from './VarenDetailZaakExploitatie.tsx';
import { default as VarenIcon } from './VarenIcon.svg?react';
import { VarenList } from './VarenList.tsx';
import { VarenThema } from './VarenThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const VarenRoutes = [
  {
    route: themaConfig.detailPageZaak.route.path,
    Component: VarenDetailPageContentExploitatieZaak,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPageVergunning.route.path,
    Component: VarenDetailPageContentExploitatieVergunning,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
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
