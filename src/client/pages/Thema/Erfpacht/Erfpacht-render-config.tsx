import { filterErfpachtFacturen } from './Erfpacht-helpers';
import {
  ERFPACHT_ZAKELIJK_ROUTE_DEFAULT,
  erfpachtFacturenTableConfig,
  routeConfig,
  themaConfig,
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
    route: themaConfig.listPage.route.path,
    Component: ErfpachtList,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPage.route.path,
    Component: ErfpachtDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.route.path,
    Component: ErfpachtThema,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.listPageFacturen.path,
    Component: () => (
      <AfisList
        themaContextParams={{
          themaId: themaConfig.id,
          tableConfig: erfpachtFacturenTableConfig,
          routeConfigListPage: routeConfig.listPageFacturen,
          routeConfigDetailPage: routeConfig.detailPageFactuur,
          factuurFilterFn: filterErfpachtFacturen,
        }}
      />
    ),
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routeConfig.detailPageFactuur.path,
    Component: () => (
      <AfisFactuur
        themaContextParams={{
          themaId: themaConfig.id,
          tableConfig: erfpachtFacturenTableConfig,
          routeConfigListPage: routeConfig.listPageFacturen,
          routeConfigDetailPage: routeConfig.detailPageFactuur,
        }}
      />
    ),
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
    const content = appState.ERFPACHT?.content;
    return (
      themaConfig.featureToggle.active &&
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

export const menuItemZakelijk: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: (appState: AppState) => {
    const content = appState.ERFPACHT?.content;
    return content && 'url' in content && content.url
      ? content.url
      : ERFPACHT_ZAKELIJK_ROUTE_DEFAULT;
  },
  profileTypes: ['commercial'], //TO DO YACINE hoe doe ik deze in de themaConfig.
  redactedScope: themaConfig.redactedScope,
  isActive: menuItem.isActive,
  IconSVG: ErfpachtIcon,
};
