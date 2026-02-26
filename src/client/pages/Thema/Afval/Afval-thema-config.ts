import type { ThemaConfigBase } from '../../../config/thema-types';

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

type AfvalThemaConfig = ThemaConfigBase;

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
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Informatie over afval laten ophalen en wegbrengen in uw buurt',
      ],
    },
  ],
  pageLinks: [], // Unused, but an alternative is used. Later on we dynamically select the right links.
};
