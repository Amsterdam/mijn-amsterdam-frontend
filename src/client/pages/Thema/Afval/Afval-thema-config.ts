import type { ThemaConfigBase } from '../../../config/thema-types';

export const featureToggle = {
  AfvalActive: true,
};
export const links = {
  AFVAL: 'https://www.amsterdam.nl/afval/',
  AFVAL_COMMERCIAL: 'https://www.amsterdam.nl/afval-hergebruik/bedrijfsafval/',
  AFVAL_MELDING_FORMULIER:
    'https://formulier.amsterdam.nl/mail/afval/afvalwijzer/',
  AFVAL_MELDING:
    'https://www.amsterdam.nl/veelgevraagd/melding-openbare-ruimte-en-overlast-cd609',
};

const THEMA_ID = 'AFVAL';
const THEMA_TITLE = 'Afval';

type AfvalThemaConfig = Pick<
  ThemaConfigBase,
  'id' | 'title' | 'profileTypes' | 'redactedScope' | 'route' | 'featureToggle'
>;

export const themaConfig: AfvalThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  route: {
    path: '/afval',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  featureToggle: {
    active: true,
  },
};
