import { routeConfig, themaId, themaTitle } from './Jeugd-thema-config';
import { JeugdDetail } from './JeugdDetail';
import { JeugdThemaPagina } from './JeugdThema';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { isLoading } from '../../../universal/helpers/api';
import { AppState } from '../../../universal/types';
import { IconJeugd } from '../../assets/icons';
import { ThemaMenuItem } from '../../config/thema-types';

export const JeugdRoutes = [
  {
    route: routeConfig.themaPage.path,
    Component: JeugdThemaPagina,
    isActive: FeatureToggle.zorgnedLeerlingenvervoerActive,
  },
  {
    route: routeConfig.detailPage.path,
    Component: JeugdDetail,
    isActive: FeatureToggle.zorgnedLeerlingenvervoerActive,
  },
];

export const menuItem: ThemaMenuItem = {
  title: themaTitle,
  id: themaId,
  profileTypes: ['private'],
  isActive(appState: AppState) {
    return (
      FeatureToggle.zorgnedLeerlingenvervoerActive &&
      !isLoading(appState.JEUGD) &&
      !!appState.JEUGD.content?.length
    );
  },
  to: routeConfig.themaPage.path,
  IconSVG: IconJeugd,
};
