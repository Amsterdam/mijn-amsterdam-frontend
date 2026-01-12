import {
  ERFPACHT_ZAKELIJK_ROUTE_DEFAULT,
  erfpachtFacturenTableConfig,
  featureToggle,
  filterErfpachtFacturen,
  routeConfig,
  themaId,
  themaTitle,
} from './Erfpacht-thema-config';
import { ErfpachtDetail } from './ErfpachtDetail';
import { default as ErfpachtIcon } from './ErfpachtIcon.svg?react';
import { ErfpachtList } from './ErfpachtList';
import { ErfpachtThema } from './ErfpachtThema';
import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';
import { AfisFactuur } from '../Afis/AfisFactuur';
import { AfisList } from '../Afis/AfisList';

export const ErfpachtRoutes = [
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
  {
    route: routeConfig.listPageFacturen.path,
    Component: () => (
      <AfisList
        themaContextParams={{
          themaId,
          tableConfig: erfpachtFacturenTableConfig,
          routeConfigListPage: routeConfig.listPageFacturen,
          routeConfigDetailPage: routeConfig.detailPageFactuur,
          factuurFilterFn: filterErfpachtFacturen,
        }}
      />
    ),
    isActive: featureToggle.erfpachtActive,
  },
  {
    route: routeConfig.detailPageFactuur.path,
    Component: () => (
      <AfisFactuur
        themaContextParams={{
          themaId,
          tableConfig: erfpachtFacturenTableConfig,
          routeConfigListPage: routeConfig.listPageFacturen,
          routeConfigDetailPage: routeConfig.detailPageFactuur,
        }}
      />
    ),
    isActive: featureToggle.erfpachtActive,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private'],
  redactedScope: 'none',
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

export function useCanonmatigingFooterLink() {
  const { relatieCode } = useErfpachtThemaData();

  if (!relatieCode) {
    return null;
  }

  const baseUrl = `https://canonmatiging${IS_PRODUCTION ? '' : '-acc'}.amsterdam.nl`;
  return {
    url: `${baseUrl}/?relatiecode=${relatieCode}`,
    label: 'Mogelijke terugbetaling bij verhuur',
  };
}

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
  redactedScope: 'none',
  isActive: menuItem.isActive,
  IconSVG: ErfpachtIcon,
};
