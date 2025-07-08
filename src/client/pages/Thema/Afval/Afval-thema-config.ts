import type { ThemaRoutesConfig } from '../../../config/thema-types.ts';

export const featureToggle = {
  AfvalActive: true,
};

export const themaId = 'AFVAL' as const;
export const themaTitle = 'Afval';

export const routeConfig = {
  themaPage: {
    path: '/afval',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

export const links = {
  AFVAL: 'https://www.amsterdam.nl/afval/',
  AFVAL_COMMERCIAL: 'https://www.amsterdam.nl/afval-hergebruik/bedrijfsafval/',
  AFVAL_MELDING_FORMULIER:
    'https://formulier.amsterdam.nl/mail/afval/afvalwijzer/',
  AFVAL_MELDING:
    'https://www.amsterdam.nl/veelgevraagd/melding-openbare-ruimte-en-overlast-cd609',
};
