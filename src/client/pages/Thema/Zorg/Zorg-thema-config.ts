import { generatePath } from 'react-router';

import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type {
  ThemaRoutesConfig,
  ThemaConfigBase,
  WithListPage,
} from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

type ZorgThemaConfig = ThemaConfigBase & WithListPage;

const THEMA_TITLE = 'Zorg en ondersteuning';

export const themaConfig: ZorgThemaConfig = {
  id: 'ZORG',
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  redactedScope: 'full',
  profileTypes: ['private'],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Uw WMO-regelingen (WMO: wet maatschappelijke ondersteuning)',
      ],
    },
  ],
  pageLinks: [
    {
      to: 'https://www.amsterdam.nl/zorg-ondersteuning/',
      title: 'Lees hier meer over zorg en ondersteuning',
    },
  ],
  route: {
    path: '/zorg-en-ondersteuning',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  listPage: {
    route: {
      path: '/zorg-en-ondersteuning/lijst/:kind/:page?',
      documentTitle: (params) =>
        `${params?.kind === listPageParamKind.actual ? 'Huidige' : 'Eerdere en afgewezen'} voorzieningen | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
};

export const listPageParamKind = {
  actual: 'huidige-voorzieningen',
  historic: 'eerdere-en-afgewezen-voorzieningen',
} as const;

type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const themaId = 'ZORG' as const;
export const themaTitle = 'Zorg en ondersteuning';

export const routeConfig = {
  detailPage: {
    path: '/zorg-en-ondersteuning/voorziening/:id',
    trackingUrl: '/zorg-en-ondersteuning/voorziening',
    documentTitle: `Voorziening | ${THEMA_TITLE}`,
  },
} as const satisfies ThemaRoutesConfig;

const displayProps: DisplayProps<WMOVoorzieningFrontend> = {
  props: {
    detailLinkComponent: 'Naam',
    displayStatus: 'Status',
    statusDateFormatted: 'Datum',
  },
  colWidths: {
    large: ['50%', '25%', '25%'],
    small: ['100%', '0', '0'],
  },
};

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige voorzieningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen voorzieningen',
} as const;

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: WMOVoorzieningFrontend) => regeling.isActual,
    displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    textNoContent: 'U heeft geen huidige voorzieningen.',
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.actual,
      page: null,
    }),
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: WMOVoorzieningFrontend) => !regeling.isActual,
    displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    textNoContent:
      'U heeft geen eerdere en/of afgewezen voorzieningen. U ziet hier niet alle gegevens uit het verleden. De gegevens die u hier niet ziet, heeft u eerder per post ontvangen.',
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
  },
} as const;
