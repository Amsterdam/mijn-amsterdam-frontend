import { ThemaRoutesConfig } from '../../../config/thema-types';

export const themaIdKVK = 'KVK' as const;
export const themaIdBRP = 'BRP' as const;

export const featureToggle = {
  [themaIdBRP]: {
    themaActive: true,
  },
  [themaIdKVK]: {
    themaActive: true,
  },
};

export const themaTitle = {
  [themaIdBRP]: 'Mijn gegevens',
  [themaIdKVK]: 'Mijn onderneming',
} as const;

export const routeConfig = {
  themaPageBRP: {
    path: '/persoonlijke-gegevens',
    documentTitle: 'Mijn gegevens',
  },
  themaPageKVK: {
    path: '/gegevens-handelsregister',
    documentTitle: 'Mijn onderneming',
  },
  listPageContactmomenten: {
    path: '/contactmomenten/:page?',
    documentTitle: `Alle contactmomenten | ${themaTitle.BRP}`,
  },
} as const satisfies ThemaRoutesConfig;
