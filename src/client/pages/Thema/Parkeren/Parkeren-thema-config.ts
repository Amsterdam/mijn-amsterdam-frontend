import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router';

import { IS_PRODUCTION } from '../../../../universal/config/env';
import { entries } from '../../../../universal/helpers/utils';
import { propagateFeatureToggles } from '../../../config/buildFeatureToggle';
import type {
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';
import {
  ListPageParamKind as ListPageParamKindVergunningen,
  tableConfig as tableConfigVergunningen,
} from '../Vergunningen/Vergunningen-thema-config';

export const featureToggle = {
  parkerenActive: true,
  parkerenCheckForProductAndPermitsActive: !IS_PRODUCTION,
  parkerenJWETokenCreationActive: !IS_PRODUCTION,
};

const THEMA_ID = 'PARKEREN';
const THEMA_TITLE = 'Parkeren';

type ParkerenThemaConfig = ThemaConfigBase<typeof THEMA_ID> &
  WithListPage &
  WithDetailPage;

export const themaConfig: ParkerenThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  featureToggle: propagateFeatureToggles({
    active: false,
    parkerenCheckForProductAndPermitsActive: !IS_PRODUCTION,
    parkerenJWETokenCreationActive: !IS_PRODUCTION,
  }),
  route: {
    path: '/parkeren',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  pageLinks: [
    {
      to: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-bewoners/',
      title: 'Meer over parkeervergunningen',
    },
  ],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Het inzien, aanvragen of wijzigen van een bewonersvergunning',
      ],
    },
  ],
  listPage: {
    route: {
      path: '/parkeren/lijst/:kind/:page?',
      documentTitle: (params) =>
        `${tableConfigVergunningen[(params?.kind as ListPageParamKind) || 'lopende-aanvragen'].title} | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  detailPage: {
    route: {
      path: '/parkeren/:caseType/:id',
      trackingUrl: '/parkeren/parkeerfrontend',
      documentTitle: `Parkeren | ${THEMA_TITLE}`,
    },
  },
};

// export const routeConfig = {
//   detailPage: {
//     path: '/parkeren/:caseType/:id',
//     trackingUrl: '/parkeren/parkeerfrontend',
//     documentTitle: `Parkeren | ${THEMA_TITLE}`,
//   },
//   listPage: {
//     path: '/parkeren/lijst/:kind/:page?',
//     documentTitle: (params) =>
//       `${tableConfigVergunningen[(params?.kind as ListPageParamKind) || 'lopende-aanvragen'].title} | ${themaTitle}`,
//     trackingUrl: null,
//   },
//   themaPage: {
//     path: '/parkeren',
//     documentTitle: `${THEMA_TITLE} | overzicht`,
//     trackingUrl: null,
//   },
// } as const satisfies ThemaRoutesConfig;

// export const linkListItems: LinkProps[] = [
//   {
//     to: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-bewoners/',
//     title: 'Meer over parkeervergunningen',
//   },
// ];

export type ListPageParamKind = ListPageParamKindVergunningen;

export const tableConfig = Object.fromEntries(
  entries(cloneDeep(tableConfigVergunningen)).map(([kind, tableConfig]) => {
    return [
      kind,
      {
        ...tableConfig,
        listPageRoute: generatePath(themaConfig.listPage.route.path, {
          kind,
          page: null,
        }),
      },
    ];
  })
);
