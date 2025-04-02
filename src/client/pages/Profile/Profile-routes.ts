import { MijnBedrijfsGegevensThema } from './commercial/ProfileCommercial';
import { routes as routesContactmomenten } from './private/Contactmomenten.config';
import { ContactmomentenListPage } from './private/ContactmomentenListPage';
import { MijnGegevensThema } from './private/ProfilePrivate';
import { routes } from './Profile-thema-config';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

export const ProfileRoutes = [
  { route: routes.BRP, Component: MijnGegevensThema },
  {
    route: routes.KVK,
    Component: MijnBedrijfsGegevensThema,
  },
  {
    route: routesContactmomenten.listPage,
    Component: ContactmomentenListPage,
    isActive: FeatureToggle.contactmomentenActive,
  },
];
