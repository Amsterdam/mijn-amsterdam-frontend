import type {
  ThemaConfigBase,
  ThemaRoutesConfig,
} from '../../../config/thema-types';

export const featureToggle = {
  AfvalActive: true,
};

const THEMA_ID = 'AFVAL';
const THEMA_TITLE = 'Afval';

type AfvalThemaConfig = Pick<ThemaConfigBase, 'id' | 'title'>;

export const themaConfig: AfvalThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
};

export const links = {
  AFVAL: 'https://www.amsterdam.nl/afval/',
  AFVAL_COMMERCIAL: 'https://www.amsterdam.nl/afval-hergebruik/bedrijfsafval/',
  AFVAL_MELDING_FORMULIER:
    'https://formulier.amsterdam.nl/mail/afval/afvalwijzer/',
  AFVAL_MELDING:
    'https://www.amsterdam.nl/veelgevraagd/melding-openbare-ruimte-en-overlast-cd609',
};

export const routeConfig = {
  themaPage: {
    path: '/afval',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;
