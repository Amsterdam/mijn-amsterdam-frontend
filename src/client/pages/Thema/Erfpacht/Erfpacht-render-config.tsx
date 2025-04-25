import { ErfpachtDossierDetail } from './DossierDetail/ErfpachtDossierDetail';
import { Erfpacht } from './Erfpacht';
import {
  ERFPACHT_ZAKELIJK_ROUTE_DEFAULT,
  featureToggle,
  routeConfig,
  themaId,
  themaTitle,
} from './Erfpacht-thema-config';
import { ErfpachtDossiers } from './ErfpachtDossiers';
import { ErfpachtFacturen } from './ErfpachtFacturen';
import { default as ErfpachtIcon } from './ErfpachtIcon.svg?react';
import { ErfpachtOpenFacturen } from './ErfpachtOpenFacturen';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const ErfpachtRoutes = [
  {
    route: routeConfig.listPageOpenFacturen.path,
    Component: ErfpachtOpenFacturen,
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.listPageAlleFacturen.path,
    Component: ErfpachtFacturen,
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.listPageDossiers.path,
    Component: ErfpachtDossiers,
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.detailPage.path,
    Component: ErfpachtDossierDetail,
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.themaPage.path,
    Component: Erfpacht,
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
