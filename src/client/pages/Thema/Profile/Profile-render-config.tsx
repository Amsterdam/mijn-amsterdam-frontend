import { BuildingsIcon } from '@amsterdam/design-system-react-icons';

import { MijnBedrijfsGegevensThema } from './commercial/ProfileCommercial.tsx';
import { ContactmomentenListPage } from './private/ContactmomentenListPage.tsx';
import { MijnGegevensThema } from './private/ProfilePrivate.tsx';
import { VvEDetail } from './private/VvEDetail.tsx';
import { themaConfig } from './Profile-thema-config.ts';
import { default as ProfilePrivateIcon } from './ProfilePrivateIcon.svg?react';
import { FeatureToggle } from '../../../../universal/config/feature-toggles.ts';
import { isLoading } from '../../../../universal/helpers/api.ts';
import type { AppState } from '../../../../universal/types/App.types.ts';
import type { ThemaMenuItem } from '../../../config/thema-types.ts';

export const ProfileRoutes = [
  { route: themaConfig.BRP.route.path, Component: MijnGegevensThema },
  {
    route: themaConfig.KVK.route.path,
    Component: MijnBedrijfsGegevensThema,
  },
  {
    route: themaConfig.BRP.detailPageVvE.route.path,
    Component: VvEDetail,
    isActive: themaConfig.BRP.featureToggle.wonenActive,
  },
  {
    route: themaConfig.BRP.listPageContactmomenten.route.path,
    Component: ContactmomentenListPage,
    isActive: FeatureToggle.contactmomentenActive,
  },
];

export const menuItems: ThemaMenuItem[] = [
  {
    title: themaConfig.BRP.title,
    id: themaConfig.BRP.id,
    to: themaConfig.BRP.route.path,
    profileTypes: themaConfig.BRP.profileTypes,
    redactedScope: themaConfig.BRP.redactedScope,
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
    to: themaConfig.KVK.route.path,
    redactedScope: themaConfig.KVK.redactedScope,
    profileTypes: themaConfig.KVK.profileTypes,
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
