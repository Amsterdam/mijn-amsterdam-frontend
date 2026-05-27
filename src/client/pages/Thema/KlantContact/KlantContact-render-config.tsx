import { ConnectedCirclesIcon } from '@amsterdam/design-system-react-icons';

import { AfspraakListPage } from './Afspraken/AfspraakListPage.tsx';
import { ContactgegevenInstellen } from './Communicatievoorkeuren/ContactgegevenInstellen.tsx';
import { ContactmomentenListPage } from './Contactmomenten/ContactmomentenListPage.tsx';
import { themaConfig } from './KlantContact-thema-config.ts';
import { KlantContactThema } from './KlantContactThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const KlantContactRoutes = [
  {
    route: themaConfig.route.path,
    Component: KlantContactThema,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPageContactmomenten.route.path,
    Component: ContactmomentenListPage,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPageAfspraken.route.path,
    Component: AfspraakListPage,
    isActive: themaConfig.featureToggle.afspraken.active,
  },
  {
    route: themaConfig.detailPageContactgegevenInstellen.route.path,
    Component: ContactgegevenInstellen,
    isActive: themaConfig.featureToggle.communicatievoorkeuren.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    const klantContactState = appState.KLANT_CONTACT;
    const klantContactContent = klantContactState.content;
    return !!(
      themaConfig.featureToggle.active &&
      !isLoading(klantContactState) &&
      klantContactContent &&
      (klantContactContent.communicatievoorkeuren !== null ||
        klantContactContent?.contactmomenten?.length ||
        klantContactContent?.afspraken?.length)
    );
  },
  IconSVG: ConnectedCirclesIcon,
};
