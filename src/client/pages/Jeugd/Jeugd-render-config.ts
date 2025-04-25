import {
  routeConfig,
  themaId,
  themaTitle,
  zorgnedLeerlingenvervoerActive,
} from './Jeugd-thema-config';
import { JeugdDetail } from './JeugdDetail';
import { JeugdThemaPagina } from './JeugdThema';
import { isLoading } from '../../../universal/helpers/api';
import { AppState } from '../../../universal/types';
import { IconJeugd } from '../../assets/icons';
import { ThemaMenuItem } from '../../config/thema-types';

export const JeugdRoutes = [
  {
    route: routeConfig.themaPage.path,
    Component: JeugdThemaPagina,
    isActive: zorgnedLeerlingenvervoerActive,
  },
  {
    route: routeConfig.detailPage.path,
    Component: JeugdDetail,
    isActive: zorgnedLeerlingenvervoerActive,
  },
];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  profileTypes: ['private'],
  isActive(appState: AppState) {
    return (
      zorgnedLeerlingenvervoerActive &&
      !isLoading(appState.JEUGD) &&
      !!appState.JEUGD.content?.length
    );
  },
  to: routeConfig.themaPage.path,
  IconSVG: IconJeugd,
};
