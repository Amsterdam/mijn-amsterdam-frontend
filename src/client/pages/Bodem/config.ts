import { generatePath } from 'react-router-dom';

import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';

const displayPropsAanvragen = {
  detailLinkComponent: 'Adres',
  datumAanvraagFormatted: 'Aangevraagd',
  status: 'Status',
};

const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
};

const tableConfigBase = {
  sort: dateSort('dateRequest', 'desc'),
  displayProps: displayPropsAanvragen,
};

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    ...tableConfigBase,
    title: 'Lopende aanvragen',
    filter: (bodemAanvraag: LoodMetingFrontend) => !bodemAanvraag.processed,
    listPageRoute: generatePath(AppRoutes['BODEM/LIST'], {
      kind: listPageParamKind.inProgress,
    }),
  },
  [listPageParamKind.completed]: {
    ...tableConfigBase,
    title: 'Afgehandelde aanvragen',
    filter: (bodemAanvraag: LoodMetingFrontend) => bodemAanvraag.processed,
    listPageRoute: generatePath(AppRoutes['BODEM/LIST'], {
      kind: listPageParamKind.completed,
    }),
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over lood in de bodem.',
    to: 'https://www.amsterdam.nl/wonen-leefomgeving/bodem/lood-grond/',
  },
] as const;
