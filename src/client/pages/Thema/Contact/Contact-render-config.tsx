import { CommunicatievoorkeurDetail } from './Communicatievoorkeuren/CommunicatieVoorkeurDetail';
import { CommunicatievoorkeurInstellen } from './Communicatievoorkeuren/CommunicatievoorkeurInstellen';
import { routeConfig, themaId, themaTitle } from './Contact-thema-config';
import { default as InkomenIcon } from './ContactIcon.svg?react';
import { ContactmomentenListPage } from './Contactmomenten/ContactmomentenListPage';
import { ContactThemaPagina } from './ContactThema';
import { isLoading } from '../../../../universal/helpers/api';
import type { AppState } from '../../../../universal/types/App.types';
import type { ThemaMenuItem } from '../../../config/thema-types';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export const ContactRoutes = [
  {
    route: routeConfig.themaPage.path,
    Component: ContactThemaPagina,
  },
  {
    route: routeConfig.listPageContactmomenten.path,
    Component: () => {
      const breadcrumbs = useThemaBreadcrumbs(themaId);
      return (
        <ContactmomentenListPage themaId={themaId} breadcrumbs={breadcrumbs} />
      );
    },
  },
  {
    route: routeConfig.detailPageCommunicatievoorkeur.path,
    Component: CommunicatievoorkeurDetail,
  },
  {
    route: routeConfig.detailPageCommunicatievoorkeurInstellen.path,
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
      !isLoading(appState.CONTACT_MOMENTEN) &&
      !!appState.CONTACT_MOMENTEN.content?.length
    );
  },
  IconSVG: InkomenIcon,
};
