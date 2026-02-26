import { ThemaConfigBase } from '../../../config/thema-types';

const SUBSIDIES_ROUTE_DEFAULT = 'https://subsidies.amsterdam.nl';
const THEMA_ID = 'SUBSIDIES';
const THEMA_TITLE = 'Subsidies';

export const themaConfig: ThemaConfigBase = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  redactedScope: 'none',
  featureToggle: {
    active: true,
  },
  profileTypes: ['private', 'commercial'],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: ['Uw aanvraag voor een subsidie'],
    },
  ],
  pageLinks: [],
  route: {
    path: SUBSIDIES_ROUTE_DEFAULT,
    trackingUrl: null,
    documentTitle: '',
  },
};
