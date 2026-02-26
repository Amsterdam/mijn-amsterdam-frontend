import { ThemaConfigBase } from '../../../config/thema-types';

const BELASTINGEN_ROUTE_DEFAULT = 'https://belastingbalie.amsterdam.nl';
const THEMA_ID = 'BELASTINGEN';
const THEMA_TITLE = 'Belastingen';

export const themaConfig: ThemaConfigBase = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  pageLinks: [],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Belastingaanslagen betalen',
        'Automatische incasso regelen',
        'Bezwaar indienen',
        'Kwijtschelding aanvragen',
        'Betalingsregeling aanvragen',
        'Aangifte doen',
        'Parkeerbon (naheffingsaanslag) betalen',
      ],
    },
  ],
  route: {
    path: BELASTINGEN_ROUTE_DEFAULT,
    trackingUrl: null,
    documentTitle: '',
  },
};
