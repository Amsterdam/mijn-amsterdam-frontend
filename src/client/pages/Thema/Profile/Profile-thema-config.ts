import { ThemaRoutesConfig } from '../../../config/thema-types';

export const themaIdKVK = 'KVK' as const;
export const themaIdBRP = 'BRP' as const;

export const featureToggle = {
  [themaIdBRP]: {
    themaActive: true,
    benkBrpServiceActive: true,
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
    documentTitle: `${themaTitle.BRP} | Mijn Amsterdam`,
    trackingUrl: null,
  },
  themaPageKVK: {
    path: '/gegevens-handelsregister',
    documentTitle: `${themaTitle.KVK} | Mijn Amsterdam`,
    trackingUrl: null,
  },
  listPageContactmomenten: {
    path: '/contactmomenten/:page?',
    documentTitle: `Alle contactmomenten | ${themaTitle.BRP}`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;

export const profileLinks = {
  CHANGE_PERSONAL_DATA:
    'https://www.amsterdam.nl/burgerzaken/fouten-gegevens-laten-aanpassen/',
  CHANGE_RESIDENT_COUNT:
    'https://www.amsterdam.nl/burgerzaken/verhuizen-inschrijving-briefadres/onjuiste-inschrijving-adres-melden/',
  REPORT_RELOCATION:
    'https://www.amsterdam.nl/burgerzaken/verhuizing-doorgeven/',
};
