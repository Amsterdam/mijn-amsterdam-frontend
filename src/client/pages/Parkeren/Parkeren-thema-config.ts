import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { entries } from '../../../universal/helpers/utils';
import { LinkProps } from '../../../universal/types';
import {
  ListPageParamKind as ListPageParamKindVergunningen,
  tableConfig as tableConfigVergunningen,
} from '../Vergunningen/Vergunningen-thema-config';

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-bewoners/',
    title: 'Meer over parkeervergunningen',
  },
];

export type ListPageParamKind = ListPageParamKindVergunningen;

export const routes = {
  listPage: AppRoutes['PARKEREN/LIST'],
  themaPage: AppRoutes.PARKEREN,
  detailPage: AppRoutes['PARKEREN/DETAIL'],
};

export const tableConfig = Object.fromEntries(
  entries(cloneDeep(tableConfigVergunningen)).map(([kind, tableConfig]) => {
    return [
      kind,
      {
        ...tableConfig,
        listPageRoute: generatePath(routes.listPage, {
          kind,
        }),
      },
    ];
  })
);
