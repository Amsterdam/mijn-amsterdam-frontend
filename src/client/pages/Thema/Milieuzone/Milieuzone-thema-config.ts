import { ThemaConfigBase } from '../../../config/thema-types';

export const THEMA_ID = 'MILIEUZONE';
export const THEMA_TITLE = 'Milieuzone';

type MilieuZoneThemaConfig = ThemaConfigBase;

export const themaConfig: MilieuZoneThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  profileTypes: ['private', 'commercial'],
  route: {
    path: 'https://ontheffingen.amsterdam.nl/publiek/aanvragen',

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
