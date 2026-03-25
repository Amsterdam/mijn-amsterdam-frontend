import { filterErfpachtFacturen } from './Erfpacht-helpers.tsx';
import {
  ERFPACHT_ZAKELIJK_ROUTE_DEFAULT,
  erfpachtFacturenTableConfig,
  themaConfig,
} from './Erfpacht-thema-config.ts';
import { ErfpachtDetail } from './ErfpachtDetail.tsx';
import { default as ErfpachtIcon } from './ErfpachtIcon.svg?react';
import { ErfpachtList } from './ErfpachtList.tsx';
import { ErfpachtThema } from './ErfpachtThema.tsx';
import { useErfpachtThemaData } from './useErfpachtThemaData.hook.ts';
import { IS_PRODUCTION } from '../../../../universal/config/env.ts';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';
import { AfisFactuur } from '../Afis/AfisFactuur.tsx';
import { AfisList } from '../Afis/AfisList.tsx';

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
    route: themaConfig.listPageFacturen.route.path,
    Component: () => (
      <AfisList
        themaContextParams={{
          themaId: themaConfig.id,
          tableConfig: erfpachtFacturenTableConfig,
          routeConfigListPage: themaConfig.listPageFacturen.route,
          routeConfigDetailPage: themaConfig.detailPageFactuur.route,
          factuurFilterFn: filterErfpachtFacturen,
        }}
      />
    ),
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPageFactuur.route.path,
    Component: () => (
      <AfisFactuur
        themaContextParams={{
          themaId: themaConfig.id,
          tableConfig: erfpachtFacturenTableConfig,
          routeConfigListPage: themaConfig.listPageFacturen.route,
          routeConfigDetailPage: themaConfig.detailPageFactuur.route,
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
  profileTypes: ['commercial'],
  redactedScope: themaConfig.redactedScope,
  isActive: menuItem.isActive,
  IconSVG: ErfpachtIcon,
};
