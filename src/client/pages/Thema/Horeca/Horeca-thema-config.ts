import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router';

import { entries } from '../../../../universal/helpers/utils';
import { LinkProps } from '../../../../universal/types/App.types';
import type {
  ThemaConfigBase,
  ThemaRoutesConfig,
} from '../../../config/thema-types';
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

const THEMA_ID = 'HORECA';
const THEMA_TITLE = 'Horeca';

type HorecaThemaConfig = Pick<
  ThemaConfigBase<typeof THEMA_ID>,
  'id' | 'title' | 'profileTypes' | 'redactedScope' | 'featureToggle' | 'route'
>;

export const themaConfig: HorecaThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  featureToggle: {
    active: true,
  },
  route: {
    path: '/horeca',
    documentTitle: `THEMA_TITLE | overzicht`,
    trackingUrl: null,
  },
};

export const routeConfig = {
  detailPage: {
    path: '/horeca/:caseType/:id',
    trackingUrl(params) {
      return `/horeca/${params?.caseType}`;
    },
    documentTitle: `Horeca | THEMA_TITLE`,
  },
  listPage: {
    path: '/horeca/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${tableConfigVergunningen[(params?.kind as ListPageParamKind) || 'lopende-aanvragen'].title} | THEMA_TITLE`,
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
