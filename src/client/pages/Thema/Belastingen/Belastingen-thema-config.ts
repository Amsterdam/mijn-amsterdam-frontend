import type { AppState } from '../../../../universal/types/App.types.ts';
import type { ThemaConfigBase } from '../../../config/thema-types.ts';

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
export const getBelastingenSSOUrl = (
  _appState: AppState,
  profileType?: string
) => {
  const path =
    profileType === 'commercial'
      ? '/eherkenning.saml.php?start'
      : '/digid.saml.php?start';
  return `${themaConfig.route.path + path}`;
};
