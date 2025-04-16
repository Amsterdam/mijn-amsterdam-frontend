import { BuildingsIcon } from '@amsterdam/design-system-react-icons';

import { MijnBedrijfsGegevensThema } from './commercial/ProfileCommercial';
import { ContactmomentenListPage } from './private/ContactmomentenListPage';
import { MijnGegevensThema } from './private/ProfilePrivate';
import {
  routes,
  themaTitle,
  themaIdBRP,
  themaIdKVK,
} from './Profile-thema-config';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { isLoading } from '../../../universal/helpers/api';
import { AppState } from '../../../universal/types';
import { IconMijnGegevens } from '../../assets/icons';
import { ThemaMenuItem } from '../../config/thema-types';

export const ProfileRoutes = [
  { route: routes.themaPageBRP, Component: MijnGegevensThema },
  {
    route: routes.themaPageKVK,
    Component: MijnBedrijfsGegevensThema,
  },
  {
    route: routes.listPageContactmomenten,
    Component: ContactmomentenListPage,
    isActive: FeatureToggle.contactmomentenActive,
  },
];

export const menuItems: ThemaMenuItem<typeof themaIdBRP | typeof themaIdKVK>[] =
  [
    {
      title: themaTitle.BRP,
      id: themaIdBRP,
      to: routes.themaPageBRP,
      profileTypes: ['private'],
      isActive(appState: AppState) {
        return !isLoading(appState.BRP) && !!appState.BRP.content?.persoon;
      },
      IconSVG: IconMijnGegevens,
    } as const,
    {
      title: themaTitle.KVK,
      id: themaIdKVK,
      to: routes.themaPageKVK,
      profileTypes: ['commercial', 'private'],
      isActive(appState: AppState) {
        return !isLoading(appState.KVK) && !!appState.KVK.content;
      },
      IconSVG: BuildingsIcon,
    } as const,
  ];
