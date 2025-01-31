import { generatePath } from 'react-router-dom';

import { VarenFrontend } from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';

export const displayPropsAanvragen = {
  detailLinkComponent: '',
  title: 'Omschrijving',
  dateRequestFormatted: 'Aangevraagd',
  status: 'Status',
};

export const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
};

const tableConfigBase = {
  sort: dateSort('dateRequest', 'desc'),
  displayProps: displayPropsAanvragen,
};

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VarenFrontend) => !vergunning.dateEnd,
    listPageRoute: generatePath(AppRoutes['VAREN/LIST'], {
      kind: listPageParamKind.inProgress,
    }),
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (vergunning: VarenFrontend) => vergunning.dateEnd,
    listPageRoute: generatePath(AppRoutes['VAREN/LIST'], {
      kind: listPageParamKind.completed,
    }),
    ...tableConfigBase,
  },
};

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/verkeer-vervoer/varen-amsterdam/varen-beroepsvaart/#:~:text=De%20passagiersvaart%20in%20Amsterdam%20is,stad%20willen%20we%20graag%20behouden.',
    title: 'Meer informatie over passagiers- en beroepsvaart',
  },
];

export const buttonItems: LinkProps[] = [
  {
    to: 'https://formulieren.acc.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/VARExploitatievergunningAanvragen.aspx',
    title: 'Exploitatievergunning aanvragen',
  },
];
