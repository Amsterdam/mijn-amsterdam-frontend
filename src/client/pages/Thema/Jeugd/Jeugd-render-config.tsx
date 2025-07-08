import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Jeugd-thema-config.ts';
import { JeugdDetail } from './JeugdDetail.tsx';
import { default as JeugdIcon } from './JeugdIcon.svg?react';
import { JeugdList } from './JeugdList.tsx';
import { JeugdThemaPagina } from './JeugdThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { AppState } from '../../../../universal/types/App.types.ts';
import { ThemaMenuItem } from '../../../config/thema-types.ts';

export const JeugdRoutes = [
  {
    route: routeConfig.themaPage.path,
    Component: JeugdThemaPagina,
    isActive: featureToggle.leerlingenvervoerActive,
  },
  {
    route: routeConfig.detailPage.path,
    Component: JeugdDetail,
    isActive: featureToggle.leerlingenvervoerActive,
  },
  {
    route: routeConfig.listPage.path,
    Component: JeugdList,
    isActive: featureToggle.leerlingenvervoerActive,
  },
];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  profileTypes: ['private'],
  isActive(appState: AppState) {
    return (
      featureToggle.leerlingenvervoerActive &&
      !isLoading(appState.JEUGD) &&
      !!appState.JEUGD.content?.length
    );
  },
  to: routeConfig.themaPage.path,
  IconSVG: JeugdIcon,
};
