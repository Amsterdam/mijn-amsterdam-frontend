import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { IdentiteitsbewijsFrontend } from '../../../universal/types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';

export const DISPLAY_PROPS_IDENTITEITSBEWIJZEN: DisplayProps<
  WithDetailLinkComponent<IdentiteitsbewijsFrontend>
> = {
  detailLinkComponent: 'Type',
  datumAfloopFormatted: 'Geldig tot',
};

export const listPageParamKind = {
  identiteitsbewijzen: 'identiteitsbewijzen',
};

export const tableConfig = {
  [listPageParamKind.identiteitsbewijzen]: {
    title: 'Paspoort en ID-kaart',
    displayProps: DISPLAY_PROPS_IDENTITEITSBEWIJZEN,
    sort: dateSort('datumAfloop', 'desc'),
    filter: () => true,
    listPageRoute: generatePath(AppRoutes['BURGERZAKEN/LIST'], {
      kind: listPageParamKind.identiteitsbewijzen,
    }),
  },
};

export const linkListItems = [
  {
    to: 'https://www.amsterdam.nl/burgerzaken',
    title: 'Overzicht en aanvragen bij burgerzaken',
  },
];

export const backLinkDetailPage = {
  to: AppRoutes.BURGERZAKEN,
  title: ThemaTitles.BURGERZAKEN,
};
