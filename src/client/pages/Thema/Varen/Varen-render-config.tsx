import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Varen-thema-config.ts';
import { VarenDetail } from './VarenDetail.tsx';
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
    route: routeConfig.detailPage.path,
    Component: VarenDetail,
    isActive: featureToggle.varenActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: VarenList,
    isActive: featureToggle.varenActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: VarenThema,
    isActive: featureToggle.varenActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['commercial'],
  isActive(appState: AppState) {
    return (
      !isLoading(appState.VAREN) &&
      (!!appState.VAREN?.content?.reder ||
        !!appState.VAREN?.content?.zaken?.length) &&
      featureToggle.varenActive
    );
  },
  IconSVG: VarenIcon,
};
