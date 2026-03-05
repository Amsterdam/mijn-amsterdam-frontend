import { BuildingsIcon } from '@amsterdam/design-system-react-icons';

import { MijnBedrijfsGegevensThema } from './commercial/ProfileCommercial';
import { ContactmomentenListPage } from './private/ContactmomentenListPage';
import { MijnGegevensThema } from './private/ProfilePrivate';
import {
  routeConfig,
  themaTitle,
  themaIdBRP,
  themaIdKVK,
} from './Profile-thema-config';
import { default as ProfilePrivateIcon } from './ProfilePrivateIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api';
import { AppState } from '../../../../universal/types/App.types';
import { isEnabled } from '../../../config/feature-toggles';
import { ThemaMenuItem } from '../../../config/thema-types';

export const ProfileRoutes = [
  { route: routeConfig.themaPageBRP.path, Component: MijnGegevensThema },
  {
    route: routeConfig.themaPageKVK.path,
    Component: MijnBedrijfsGegevensThema,
  },
  {
    route: routeConfig.listPageContactmomenten.path,
    Component: ContactmomentenListPage,
    isActive: isEnabled('CONTACTMOMENTEN.active'),
  },
];

export const menuItems: [
  ThemaMenuItem<typeof themaIdBRP>,
  ThemaMenuItem<typeof themaIdKVK>,
] = [
  {
    title: themaTitle.BRP,
    id: themaIdBRP,
    to: routeConfig.themaPageBRP.path,
    profileTypes: ['private'],
    redactedScope: 'content',
    isActive(appState: AppState) {
      return (
        (!isLoading(appState.BRP) && !!appState.BRP.content?.persoon) ||
        (!isLoading(appState.KLANT_CONTACT) &&
          !!appState.KLANT_CONTACT.content?.length)
      );
    },
    IconSVG: ProfilePrivateIcon,
  } as const,
  {
    title: themaTitle.KVK,
    id: themaIdKVK,
    to: routeConfig.themaPageKVK.path,
    redactedScope: 'content',
    profileTypes: ['commercial', 'private'],
    isActive(appState: AppState) {
      return (
        !isLoading(appState.KVK) &&
        !!(
          appState.KVK.content?.onderneming ||
          appState.KVK.content?.vestigingen?.length
        )
      );
    },
    IconSVG: BuildingsIcon,
  } as const,
];
