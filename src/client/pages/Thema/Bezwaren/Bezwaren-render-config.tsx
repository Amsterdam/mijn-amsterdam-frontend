import { themaConfig } from './Bezwaren-thema-config.ts';
import { BezwarenDetail } from './BezwarenDetail.tsx';
import { default as BezwarenIcon } from './BezwarenIcon.svg?react';
import { BezwarenList } from './BezwarenList.tsx';
import { BezwarenThema } from './BezwarenThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const BezwarenRoutes = [
  {
    route: themaConfig.detailPage.route.path,
    Component: BezwarenDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: BezwarenList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: BezwarenThema,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  redactedScope: themaConfig.redactedScope,
  profileTypes: themaConfig.profileTypes,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.BEZWAREN) &&
      !!appState.BEZWAREN.content?.length
    );
  },
  IconSVG: BezwarenIcon,
};
