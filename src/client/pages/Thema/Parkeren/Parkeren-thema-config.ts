import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router';

import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TEST,
} from '../../../../universal/config/env.ts';
import { entries } from '../../../../universal/helpers/utils.ts';
import { LinkProps } from '../../../../universal/types/App.types.ts';
import type { ThemaRoutesConfig } from '../../../config/thema-types.ts';
import {
  ListPageParamKind as ListPageParamKindVergunningen,
  tableConfig as tableConfigVergunningen,
} from '../Vergunningen/Vergunningen-thema-config.ts';

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
  },
  themaPage: {
    path: '/parkeren',
    documentTitle: `${themaTitle} | overzicht`,
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
