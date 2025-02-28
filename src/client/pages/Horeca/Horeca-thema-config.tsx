import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { entries } from '../../../universal/helpers/utils';
import { LinkProps } from '../../../universal/types/App.types';
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

export const routes = {
  listPage: AppRoutes['HORECA/LIST'],
  detailPageVergunning: AppRoutes['HORECA/DETAIL'],
  themaPage: AppRoutes.HORECA,
} as const;

const tableHeadings = {
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
        title: tableHeadings[kind],
        listPageRoute: generatePath(routes.listPage, {
          kind,
        }),
      },
    ];
  })
);
