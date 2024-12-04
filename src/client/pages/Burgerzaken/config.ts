import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { ThemaTitles } from '../../config/thema';

export const DISPLAY_PROPS_ID_KAARTEN = {
  typeAsLink: 'Type',
  datumAfloop: 'Geldig tot',
};

export const listPageParamKind = {
  identiteitsbewijzen: 'identiteitsbewijzen',
};

export const tableConfig = {
  [listPageParamKind.identiteitsbewijzen]: {
    title: 'Mijn reisdocumenten',
    displayProps: DISPLAY_PROPS_ID_KAARTEN,
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
