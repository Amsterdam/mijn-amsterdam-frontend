import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router';

import { entries } from '../../../../universal/helpers/utils';
import { LinkProps } from '../../../../universal/types/App.types';
import type { ThemaRoutesConfig } from '../../../config/thema-types';
import {
  ListPageParamKind as ListPageParamKindVergunningen,
  listPageParamKind as listPageParamKindVergunningen,
  tableConfig as tableConfigVergunningen,
} from '../Vergunningen/Vergunningen-thema-config';

export const LinkListItems: LinkProps[] = [
  // {
  //   title: '',
  //   to: '',
  // },
];

export type ListPageParamKind = ListPageParamKindVergunningen;

export const featureToggle = {
  horecaActive: true,
};

export const themaId = 'HORECA' as const;
export const themaTitle = 'Horeca';

export const routeConfig = {
  detailPage: {
    path: '/horeca/:caseType/:id',
    trackingUrl(params) {
      return `/horeca/${params?.caseType}`;
    },
    documentTitle: `Horeca | ${themaTitle}`,
  },
  listPage: {
    path: '/horeca/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${tableConfigVergunningen[(params?.kind as ListPageParamKind) || 'lopende-aanvragen'].title} | ${themaTitle}`,
    trackingUrl: null,
  },
  themaPage: {
    path: '/horeca',
    documentTitle: `${themaTitle} | overzicht`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;

const tableConfigTitles = {
  [listPageParamKindVergunningen.inProgress]: 'Lopende aanvragen',
  [listPageParamKindVergunningen.actual]: 'Huidige vergunningen',
  [listPageParamKindVergunningen.historic]:
    'Eerdere en niet verleende vergunningen',
} as const;

export const tableConfig = Object.fromEntries(
  entries(cloneDeep(tableConfigVergunningen)).map(([kind, tableConfig]) => {
    return [
      kind,
      {
        ...tableConfig,
        title: tableConfigTitles[kind],
        listPageRoute: generatePath(routeConfig.listPage.path, {
          kind,
          page: null,
        }),
      },
    ];
  })
);
