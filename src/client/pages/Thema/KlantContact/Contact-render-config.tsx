import { routeConfig, themaId, themaTitle } from './Contact-thema-config.ts';
import { default as ContactIcon } from './ContactIcon.svg?react';
import { ContactmomentenListPage } from './Contactmomenten/ContactmomentenListPage.tsx';
import { ContactThemaPagina } from './ContactThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import type { AppState } from '../../../../universal/types/App.types.ts';
import type { ThemaMenuItem } from '../../../config/thema-types.ts';
import { CommunicatievoorkeurInstellen } from './Communicatievoorkeuren/CommunicatievoorkeurInstellen.tsx';

export const ContactRoutes = [
  {
    route: routeConfig.themaPage.path,
    Component: ContactThemaPagina,
  },
  {
    route: routeConfig.listPageContactmomenten.path,
    Component: ContactmomentenListPage,
  },
  {
    route: routeConfig.detailPageCommunicatievoorkeurInstellen.path,
    Component: CommunicatievoorkeurInstellen,
  },
  {
    route: routeConfig.detailPageCommunicatieMediumInstellen.path,
    Component: CommunicatievoorkeurInstellen,
  },
];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  redactedScope: 'full',
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      !isLoading(appState.KLANT_CONTACT) &&
      !!appState.KLANT_CONTACT.content?.length
    );
  },
  IconSVG: ContactIcon,
};
