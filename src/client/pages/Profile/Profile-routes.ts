import { MijnBedrijfsGegevensThema } from './commercial/ProfileCommercial';
import { ContactmomentenListPage } from './private/ContactmomentenListPage';
import { MijnGegevensThema } from './private/ProfilePrivate';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

export const ProfileRoutes = [
  { route: '/persoonlijke-gegevens', Component: MijnGegevensThema },
  {
    route: '/gegevens-handelsregister',
    Component: MijnBedrijfsGegevensThema,
  },
  {
    route: '/contactmomenten',
    Component: ContactmomentenListPage,
    isActive: FeatureToggle.contactmomentenActive,
  },
];
