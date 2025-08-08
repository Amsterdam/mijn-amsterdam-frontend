import { getThemaTitleWithAppState } from './helpers';
import { themaId, routeConfig, featureToggle } from './HLI-thema-config';
import { HLIDetail } from './HLIDetail';
import { default as HLIIcon } from './HLIIcon.svg?react';
import { HLIList } from './HLIList';
import { HLIStadspasDetail } from './HLIStadspasDetail';
import { HLIThema } from './HLIThema';
import { isLoading } from '../../../../universal/helpers/api';
import type { AppState } from '../../../../universal/types/App.types';
import type {
  ThemaRenderRouteConfig,
  ThemaMenuItem,
} from '../../../config/thema-types';

export const HLIRoutes = [
  {
    route: routeConfig.detailPageStadspas.path,
    Component: HLIStadspasDetail,
    isActive: featureToggle.hliStadspasActive,
  },
  {
    route: routeConfig.detailPage.path,
    Component: HLIDetail,
    isActive: featureToggle.hliActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: HLIList,
    isActive: featureToggle.hliActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: HLIThema,
    isActive: featureToggle.hliActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: (appState: AppState) => {
    return getThemaTitleWithAppState(appState);
  },
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private'],
  redactedScope: 'full',
  isActive(appState: AppState) {
    const hasStadspas =
      !!appState.HLI?.content?.stadspas?.stadspassen?.length &&
      featureToggle.hliStadspasActive;
    const hasRegelingen =
      !!appState.HLI?.content?.regelingen?.length && featureToggle.hliActive;
    const isLoadingHLI = isLoading(appState.HLI);
    return (
      featureToggle.hliActive && !isLoadingHLI && (hasStadspas || hasRegelingen)
    );
  },
  IconSVG: HLIIcon,
};
