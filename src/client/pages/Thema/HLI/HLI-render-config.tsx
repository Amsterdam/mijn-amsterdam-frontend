import { getThemaTitleWithAppState } from './helpers';
// routeconfig en featuretoggle moeten eerst gefixed worden komt omdat hlistadspas nog niet goed in het themaconfig zit dit is opdracht 2 in jira
import {
  themaId, 
  routeConfig,
  featureToggle,
  themaConfig,
} from './HLI-thema-config';
import { HLIDetail } from './HLIDetail';
import { default as HLIIcon } from './HLIIcon.svg?react';
import { HLIList } from './HLIList';
import { HLISpecificatieList } from './HLISpecificatieList';
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
    route: routeConfig.specificatieListPage.path,
    Component: HLISpecificatieList,
    isActive: featureToggle.hliRegelingEnabledRTM,
  },
  {
    route: routeConfig.regelingenListPage.path,
    Component: HLIList,
    isActive: featureToggle.hliActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: HLIThema,
    isActive: featureToggle.hliActive,
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
      themaConfig.featureToggle.themaActive &&
      !isLoading(appState.HLI) &&
      (!!appState.HLI?.content?.stadspas?.stadspassen?.length ||
        !!appState.HLI?.content?.regelingen?.length)
    );
  },
  IconSVG: HLIIcon,
};
