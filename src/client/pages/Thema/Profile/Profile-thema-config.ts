import { IS_AP } from '../../../../universal/config/env';
import { ThemaRoutesConfig } from '../../../config/thema-types';

export const themaIdKVK = 'KVK' as const;
export const themaIdBRP = 'BRP' as const;

export const featureToggle = {
  [themaIdBRP]: {
    themaActive: true,
    benkBrpServiceActive: !IS_AP,
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
  },
  themaPageKVK: {
    path: '/gegevens-handelsregister',
    documentTitle: `${themaTitle.KVK} | Mijn Amsterdam`,
  },
  listPageContactmomenten: {
    path: '/contactmomenten/:page?',
    documentTitle: `Alle contactmomenten | ${themaTitle.BRP}`,
  },
} as const satisfies ThemaRoutesConfig;

export const profileLinks = {
  CHANGE_PERSONAL_DATA:
    'https://www.amsterdam.nl/burgerzaken/fouten-gegevens-laten-aanpassen/',
  CHANGE_RESIDENT_COUNT:
    'https://www.amsterdam.nl/veelgevraagd/onjuiste-inschrijving-melden-ef918',
  REPORT_RELOCATION:
    'https://www.amsterdam.nl/burgerzaken/verhuizing-doorgeven/',
};
