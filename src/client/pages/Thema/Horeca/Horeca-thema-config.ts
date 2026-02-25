import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router';

import { entries } from '../../../../universal/helpers/utils';
import { LinkProps } from '../../../../universal/types/App.types';
import type {
  ThemaConfigBase,
  ThemaRoutesConfig,
  WithListPage,
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

type HorecaThemaConfig = ThemaConfigBase<typeof THEMA_ID> & WithListPage;

export const themaConfig: HorecaThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  featureToggle: {
    active: true,
  },
  pageLinks: [],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Inzien van uw aanvragen voor Horeca en ontheffingen bij gemeente Amsterdam.',
      ],
    },
  ],
  route: {
    path: '/horeca',
    documentTitle: `THEMA_TITLE | overzicht`,
    trackingUrl: null,
  },
  listPage: {
    route: {
      path: '/horeca/lijst/:kind/:page?',
      documentTitle: (params) =>
        `${tableConfigVergunningen[(params?.kind as ListPageParamKind) || 'lopende-aanvragen'].title} | THEMA_TITLE`,
      trackingUrl: null,
    },
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
        listPageRoute: generatePath(themaConfig.listPage.route.path, {
          kind,
          page: null,
        }),
      },
    ];
  })
);
