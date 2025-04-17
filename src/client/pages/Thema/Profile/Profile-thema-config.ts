import { ThemaRoutesConfig } from '../../../config/thema-types';
import { toDocumentTitles, toRoutes } from '../../../helpers/thema-config';

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

const routeConfig = {
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

export const routes = toRoutes(routeConfig);
export const documentTitles = toDocumentTitles(routeConfig);

export const errorMessage = {
  [themaIdKVK]: 'Mijn onderneming',
  [themaIdBRP]: 'Persoonlijke gegevens, paspoort, ID-kaart',
};

// TODO: Integrate search config with the new thema config ?
