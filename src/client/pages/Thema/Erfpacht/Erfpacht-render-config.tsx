import {
  ERFPACHT_ZAKELIJK_ROUTE_DEFAULT,
  featureToggle,
  routeConfig,
  themaId,
  themaTitle,
} from './Erfpacht-thema-config.ts';
import { ErfpachtDetail } from './ErfpachtDetail.tsx';
import { default as ErfpachtIcon } from './ErfpachtIcon.svg?react';
import { ErfpachtList } from './ErfpachtList.tsx';
import { ErfpachtListFacturen } from './ErfpachtListFacturen.tsx';
import { ErfpachtListOpenFacturen } from './ErfpachtListOpenFacturen.tsx';
import { ErfpachtThema } from './ErfpachtThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const ErfpachtRoutes = [
  {
    route: routeConfig.listPageOpenFacturen.path,
    Component: ErfpachtListOpenFacturen,
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.listPageAlleFacturen.path,
    Component: ErfpachtListFacturen,
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: ErfpachtList,
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.detailPage.path,
    Component: ErfpachtDetail,
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: ErfpachtThema,
    isActive: featureToggle.erfpachtActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private'],
  isActive(appState: AppState) {
    const content = appState.ERFPACHT?.content;
    return (
      featureToggle.erfpachtActive &&
      !isLoading(appState.ERFPACHT) &&
      content !== null &&
      (('dossiers' in content && !!content.dossiers.dossiers?.length) ||
        !!content?.isKnown)
    );
  },
  IconSVG: ErfpachtIcon,
};

export const menuItemZakelijk: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: (appState: AppState) => {
    const content = appState.ERFPACHT?.content;
    return content && 'url' in content && content.url
      ? content.url
      : ERFPACHT_ZAKELIJK_ROUTE_DEFAULT;
  },
  profileTypes: ['commercial'],
  isActive: menuItem.isActive,
  IconSVG: ErfpachtIcon,
};
