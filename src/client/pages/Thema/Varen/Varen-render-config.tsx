import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Varen-thema-config';
import { VarenDetail } from './VarenDetail';
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
