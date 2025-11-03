import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router';

import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TEST,
} from '../../../../universal/config/env';
import { entries } from '../../../../universal/helpers/utils';
import { LinkProps } from '../../../../universal/types/App.types';
import type { ThemaRoutesConfig } from '../../../config/thema-types';
import {
  ListPageParamKind as ListPageParamKindVergunningen,
  tableConfig as tableConfigVergunningen,
} from '../Vergunningen/Vergunningen-thema-config';

export const featureToggle = {
  parkerenActive: true,
  parkerenCheckForProductAndPermitsActive: !IS_PRODUCTION,
  parkerenJWETokenCreationActive: IS_DEVELOPMENT || IS_TEST,
};

export const themaId = 'PARKEREN' as const;
export const themaTitle = 'Parkeren';

export const routeConfig = {
  detailPage: {
    path: '/parkeren/:caseType/:id',
    trackingUrl: '/parkeren/parkeerfrontend',
    documentTitle: `Parkeren | ${themaTitle}`,
  },
  listPage: {
    path: '/parkeren/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${tableConfigVergunningen[(params?.kind as ListPageParamKind) || 'lopende-aanvragen'].title} | ${themaTitle}`,
    trackingUrl: null,
  },
  themaPage: {
    path: '/parkeren',
    documentTitle: `${themaTitle} | overzicht`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-bewoners/',
    title: 'Meer over parkeervergunningen',
  },
];

export type ListPageParamKind = ListPageParamKindVergunningen;

export const tableConfig = Object.fromEntries(
  entries(cloneDeep(tableConfigVergunningen)).map(([kind, tableConfig]) => {
    return [
      kind,
      {
        ...tableConfig,
        listPageRoute: generatePath(routeConfig.listPage.path, {
          kind,
          page: null,
        }),
      },
    ];
  })
);
