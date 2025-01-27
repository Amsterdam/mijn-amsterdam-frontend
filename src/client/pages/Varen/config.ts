import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { VarenFrontend } from '../../../server/services/varen/config-and-types';

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
