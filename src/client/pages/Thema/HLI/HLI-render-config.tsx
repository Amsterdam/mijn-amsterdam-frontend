import { getThemaTitleWithAppState } from './helpers';
import { themaId, featureToggle, themaConfig } from './HLI-thema-config';
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
    route: themaConfig.stadspasPage.route.path,
    Component: HLIStadspasDetail,
    isActive: themaConfig.featureToggle.hliStadspasActive,
  },
  {
    route: themaConfig.detailPage.route.path,
    Component: HLIDetail,
    isActive: themaConfig.featureToggle.themaActive,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: HLIList,
    isActive: themaConfig.featureToggle.themaActive,
  },
  {
    route: themaConfig.route.path,
    Component: HLIThema,
    isActive: themaConfig.featureToggle.themaActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: (appState: AppState) => {
    return getThemaTitleWithAppState(appState);
  },
  id: themaId,
  to: themaConfig.route.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
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
