import { ThemaConfigBase } from '../../../config/thema-types';

const OVERTREDINGEN_ROUTE_DEFAULT =
  'https://ontheffingen.amsterdam.nl/publiek/aanvragen';

const THEMA_ID = 'OVERTREDINGEN';
const THEMA_TITLE = 'Overtredingen voertuigen';

export const themaConfig: ThemaConfigBase = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  pageLinks: [],
  route: {
    path: OVERTREDINGEN_ROUTE_DEFAULT,
    trackingUrl: null,
    documentTitle: '',
  },
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: ['Inzien van uw overtredingen in de milieuzone'],
    },
  ],
};
