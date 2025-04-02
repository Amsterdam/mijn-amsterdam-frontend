import { routes as contactmomentenRoutes } from './private/Contactmomenten.config';
import { isLoading } from '../../../universal/helpers/api';
import { AppState } from '../../../universal/types/App.types';
import { ThemaMenuItem } from '../../config/thema-types';

export const themaId = { BRP: 'BRP', KVK: 'KVK' } as const;
export type ProfileThemaID = (typeof themaId)[keyof typeof themaId];

export const featureToggle = {
  [themaId.BRP]: {
    themaActive: true,
  },
  [themaId.KVK]: {
    themaActive: true,
  },
};

export const themaTitle = {
  [themaId.BRP]: 'Mijn gegevens',
  [themaId.KVK]: 'Mijn onderneming',
} as const;

export const routes = {
  [themaId.BRP]: '/persoonlijke-gegevens',
  [themaId.KVK]: '/gegevens-handelsregister',
} as const;

export const documentTitles = {
  [routes.BRP]: `Mijn gegevens`,
  [routes.KVK]: `Mijn onderneming`,
  [contactmomentenRoutes.listPage]: `Alle contactmomenten | ${themaTitle.BRP}`,
} as const;

export const menuItems: ThemaMenuItem[] = [
  {
    title: themaTitle.BRP,
    id: themaId.BRP,
    to: routes.BRP,
    profileTypes: ['private'],
    isActive(appState: AppState) {
      return !isLoading(appState.BRP) && !!appState.BRP.content?.persoon;
    },
  } as const,
  {
    title: themaTitle.KVK,
    id: themaId.KVK,
    to: routes.KVK,
    profileTypes: ['commercial', 'private'],
    isActive(appState: AppState) {
      return !isLoading(appState.KVK) && !!appState.KVK.content;
    },
  } as const,
];

// TODO: Integrate search config with the new thema config ?
