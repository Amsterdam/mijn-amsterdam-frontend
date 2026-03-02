import { ThemaConfigBase } from '../../../config/thema-types';

const MILIEUZONE_ROUTE_DEFAULT =
  'https://ontheffingen.amsterdam.nl/publiek/aanvragen';
const THEMA_ID = 'MILIEUZONE';
const THEMA_TITLE = 'Milieuzone';

export const themaConfig: ThemaConfigBase = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  profileTypes: ['private', 'commercial'],
  route: {
    path: MILIEUZONE_ROUTE_DEFAULT,

    trackingUrl: null,
    documentTitle: '',
  },
  redactedScope: 'none',
  pageLinks: [],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: ['Inzien van uw ontheffingen in de milieuzone'],
    },
  ],
};
