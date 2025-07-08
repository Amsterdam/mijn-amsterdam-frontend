import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Vergunningen-thema-config.ts';
import { VergunningenDetail } from './VergunningenDetail.tsx';
import { default as VergunningenIcon } from './VergunningenIcon.svg?react';
import { VergunningenList } from './VergunningenList.tsx';
import { VergunningenThema } from './VergunningenThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

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

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.vergunningenActive &&
      !isLoading(appState.VERGUNNINGEN) &&
      !!appState.VERGUNNINGEN.content?.length
    );
  },
  IconSVG: VergunningenIcon,
};
