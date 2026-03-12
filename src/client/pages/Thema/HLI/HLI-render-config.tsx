import { Navigate } from 'react-router';

import { getThemaTitleWithAppState } from './helpers.ts';
import { themaConfig } from './HLI-thema-config.ts';
import { default as HLIIcon } from './HLIIcon.svg?react';
import { HLIRegelingenDetail as HLIRegelingenDetail } from './HLIRegelingenDetail.tsx';
import { HLIRegelingenList } from './HLIRegelingenList.tsx';
import { HLISpecificatieList } from './HLISpecificatieList.tsx';
import { HLIStadspasDetail } from './HLIStadspasDetail.tsx';
import { HLIThema } from './HLIThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import type { AppState } from '../../../../universal/types/App.types.ts';
import type {
  ThemaRenderRouteConfig,
  ThemaMenuItem,
} from '../../../config/thema-types.ts';

export const HLIRoutes = [
  {
    route: themaConfig.stadspasDetailPage.route.path,
    Component: HLIStadspasDetail,
    isActive: themaConfig.featureToggle.stadspas.active,
  },
  {
    route: themaConfig.regelingenDetailPage.route.path,
    Component: HLIRegelingenDetail,
    isActive: themaConfig.featureToggle.regelingen.active,
  },
  {
    route: themaConfig.specificatieListPage.route.path,
    Component: HLISpecificatieList,
    isActive: themaConfig.featureToggle.regelingen.enabledRTM,
  },
  {
    route: themaConfig.regelingenListPage.route.path,
    Component: HLIRegelingenList,
    isActive: themaConfig.featureToggle.regelingen.active,
  },
  {
    route: themaConfig.route.path,
    Component: HLIThema,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: '/stadspas',
    Component: () => <Navigate to={themaConfig.route.path} replace />,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaConfig.id> = {
  title: (appState: AppState) => {
    return getThemaTitleWithAppState(appState);
  },
  id: themaConfig.id,
  to: themaConfig.route.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    const hasStadspas =
      !!appState.HLI?.content?.stadspas?.stadspassen?.length &&
      themaConfig.featureToggle.stadspas.active;

    const hasRegelingen =
      !!appState.HLI?.content?.regelingen?.length &&
      themaConfig.featureToggle.active;

    const isLoadingHLI = isLoading(appState.HLI);

    return (
      themaConfig.featureToggle.active &&
      !isLoadingHLI &&
      (hasStadspas || hasRegelingen)
    );
  },
  IconSVG: HLIIcon,
};
