import { themaConfig } from './Vergunningen-thema-config.ts';
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
    route: themaConfig.detailPage.route.path,
    Component: VergunningenDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: VergunningenList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: VergunningenThema,
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
      !isLoading(appState.VERGUNNINGEN) &&
      !!appState.VERGUNNINGEN.content?.length
    );
  },
  IconSVG: VergunningenIcon,
};
