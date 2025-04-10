import { ThemaRoutesConfig } from '../../config/thema-types';
import { toDocumentTitles, toRoutes } from '../../helpers/thema-config';

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
  [themaId.KVK]: 'Mijn onderneming',
  [themaId.BRP]: 'Persoonlijke gegevens, paspoort, ID-kaart',
};

// TODO: Integrate search config with the new thema config ?
