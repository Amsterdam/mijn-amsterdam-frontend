import { generatePath } from 'react-router';

import { AppRoutes } from '../../../../universal/config/routes';
import { dateSort } from '../../../../universal/helpers/date';
import {
  IdentiteitsbewijsFrontend,
  LinkProps,
} from '../../../../universal/types';
import { withOmitDisplayPropsForSmallScreens } from '../../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2';

const displayPropsBase: DisplayProps<
  WithDetailLinkComponent<IdentiteitsbewijsFrontend>
> = {
  detailLinkComponent: 'Type',
  datumAfloopFormatted: 'Geldig tot',
};

const listPageParamKind = {
  identiteitsbewijzen: 'identiteitsbewijzen',
};

const displayProps = withOmitDisplayPropsForSmallScreens(displayPropsBase, [
  'datumAfloopFormatted',
]);

export const routes = {
  listPage: AppRoutes['BURGERZAKEN/LIST'],
  themaPage: AppRoutes.BURGERZAKEN,
  detailPage: AppRoutes['BURGERZAKEN/IDENTITEITSBEWIJS'],
};

export const tableConfig = {
  [listPageParamKind.identiteitsbewijzen]: {
    title: 'Mijn reisdocumenten',
    displayProps,
    sort: dateSort('datumAfloop', 'desc'),
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.identiteitsbewijzen,
      page: null,
    }),
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/burgerzaken',
    title: 'Overzicht en aanvragen bij burgerzaken',
  },
] as const;
