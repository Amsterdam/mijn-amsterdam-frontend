import { generatePath } from 'react-router';

import { LeerlingenvervoerVoorzieningFrontend } from '../../../../server/services/jeugd/jeugd';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';

const THEMA_TITLE = 'Onderwijs en Jeugd';
const THEMA_ID = 'JEUGD';

const detailRouteBase = '/jeugd/voorziening';

type ThemaConfigJeugd = ThemaConfigBase & WithListPage & WithDetailPage;

export const themaConfig: ThemaConfigJeugd = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  redactedScope: 'full',
  profileTypes: ['private'],
  route: {
    path: '/jeugd',
    documentTitle: THEMA_TITLE,
    trackingUrl: null,
  },
  featureToggle: {
    active: true,
  },
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Openbaar vervoer abonnement',
        'Openbaar vervoer vergoeding',
        'Eigen vervoer',
        'Fietsvergoeding',
        'Aangepast individueel vervoer',
        'Aangepast groepsvervoer',
      ],
    },
  ],
  pageLinks: [
    {
      to: 'https://www.amsterdam.nl/onderwijs/leerlingenvervoer/leerlingenvervoer-aanvragen/',
      title: 'Lees hier meer over Leerlingenvervoer',
    },
  ],
  listPage: {
    route: {
      path: '/jeugd/lijst/:kind/:page?',
      documentTitle: THEMA_TITLE,
      trackingUrl: null,
    },
  },
  detailPage: {
    route: {
      path: `${detailRouteBase}/:id`,
      documentTitle: `Voorziening | ${THEMA_TITLE}`,
      trackingUrl: detailRouteBase,
    },
  },
} as const;

const displayProps: DisplayProps<LeerlingenvervoerVoorzieningFrontend> = {
  props: {
    detailLinkComponent: 'Voorziening',
    displayStatus: 'Status',
    statusDateFormatted: 'Datum',
  },
  colWidths: {
    large: ['50%', '25%', '25%'],
    small: ['100%', '0', '0'],
  },
};

export const listPageParamKind = {
  actual: 'huidige-voorzieningen',
  historic: 'eerdere-en-afgewezen-voorzieningen',
} as const;

type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige voorzieningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen voorzieningen',
} as const;

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      regeling.isActual,
    displayProps,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.actual,
      page: null,
    }),
    maxItems: 5,
    textNoContent: 'U heeft geen huidige voorzieningen.',
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      !regeling.isActual,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
    displayProps,
    maxItems: 5,
    textNoContent: 'U heeft geen eerdere en/of afgewezen voorzieningen.',
  },
} as const;
