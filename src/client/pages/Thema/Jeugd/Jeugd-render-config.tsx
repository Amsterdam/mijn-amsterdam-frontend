import { themaConfig } from './Jeugd-thema-config';
import { JeugdDetail } from './JeugdDetail';
import { default as JeugdIcon } from './JeugdIcon.svg?react';
import { JeugdList } from './JeugdList';
import { JeugdThemaPagina } from './JeugdThema';
import { isLoading } from '../../../../universal/helpers/api';
import { AppState } from '../../../../universal/types/App.types';
import { ThemaMenuItem } from '../../../config/thema-types';

export const JeugdRoutes = [
  {
    route: themaConfig.route.path,
    Component: JeugdThemaPagina,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.detailPage.route.path,
    Component: JeugdDetail,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPage.route.path,
    Component: JeugdList,
    isActive: themaConfig.featureToggle.active,
  },
];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  redactedScope: themaConfig.redactedScope,
  profileTypes: themaConfig.profileTypes,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.JEUGD) &&
      !!appState.JEUGD.content?.length
    );
  },
  to: themaConfig.route.path,
  IconSVG: JeugdIcon,
};
