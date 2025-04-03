import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { IdentiteitsbewijsFrontend, LinkProps } from '../../../universal/types';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

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

export const tableConfig = {
  [listPageParamKind.identiteitsbewijzen]: {
    title: 'Mijn reisdocumenten',
    displayProps,
    sort: dateSort('datumAfloop', 'desc'),
    listPageRoute: generatePath(AppRoutes['BURGERZAKEN/LIST'], {
      kind: listPageParamKind.identiteitsbewijzen,
    }),
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/burgerzaken',
    title: 'Overzicht en aanvragen bij burgerzaken',
  },
] as const;

export const backLinkDetailPage = AppRoutes.BURGERZAKEN;
