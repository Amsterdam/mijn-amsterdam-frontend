import { BuildingsIcon } from '@amsterdam/design-system-react-icons';

import { MijnBedrijfsGegevensThema } from './commercial/ProfileCommercial.tsx';
import { ContactmomentenListPage } from './private/ContactmomentenListPage.tsx';
import { MijnGegevensThema } from './private/ProfilePrivate.tsx';
import { routeConfig, themaConfig } from './Profile-thema-config.ts';
import { default as ProfilePrivateIcon } from './ProfilePrivateIcon.svg?react';
import { FeatureToggle } from '../../../../universal/config/feature-toggles.ts';
import { isLoading } from '../../../../universal/helpers/api.ts';
import type { AppState } from '../../../../universal/types/App.types.ts';
import type { ThemaMenuItem } from '../../../config/thema-types.ts';

export const ProfileRoutes = [
  { route: routeConfig.themaPageBRP.path, Component: MijnGegevensThema },
  {
    route: routeConfig.themaPageKVK.path,
    Component: MijnBedrijfsGegevensThema,
  },
  {
    route: routeConfig.listPageContactmomenten.path,
    Component: ContactmomentenListPage,
    isActive: FeatureToggle.contactmomentenActive,
  },
];

export const menuItems: ThemaMenuItem[] = [
  {
    title: themaConfig.BRP.title,
    id: themaConfig.BRP.id,
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
    title: themaConfig.KVK.title,
    id: themaConfig.KVK.id,
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
