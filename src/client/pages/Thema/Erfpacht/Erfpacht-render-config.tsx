import { ErfpachtDossierDetail } from './DossierDetail/ErfpachtDossierDetail';
import { Erfpacht } from './Erfpacht';
import {
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
    return (
      featureToggle.erfpachtActive &&
      !isLoading(appState.ERFPACHT) &&
      appState.ERFPACHT.content !== null &&
      (('dossiers' in appState.ERFPACHT.content &&
        !!appState.ERFPACHT.content.dossiers.dossiers?.length) ||
        !!appState.ERFPACHT.content?.isKnown)
    );
  },
  IconSVG: ErfpachtIcon,
};

export const menuItemZakelijk: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: import.meta.env.REACT_APP_SSO_URL_ERFPACHT_ZAKELIJK,
  profileTypes: ['commercial'],
  rel: 'external',
  isActive: menuItem.isActive,
  IconSVG: ErfpachtIcon,
};
