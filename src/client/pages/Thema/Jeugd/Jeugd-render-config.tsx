import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './Jeugd-thema-config';
import { JeugdDetail } from './JeugdDetail';
import { default as JeugdIcon } from './JeugdIcon.svg?react';
import { JeugdList } from './JeugdList';
import { JeugdThemaPagina } from './JeugdThema';
import { isLoading } from '../../../../universal/helpers/api';
import { AppState } from '../../../../universal/types/App.types';
import { ThemaMenuItem } from '../../../config/thema-types';

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
  redactedScope: 'full',
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
