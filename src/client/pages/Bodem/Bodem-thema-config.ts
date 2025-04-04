import { generatePath } from 'react-router';

import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND = 5;

const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const routes = {
  listPage: AppRoutes['BODEM/LIST'],
  themaPage: AppRoutes.BODEM,
  detailPage: AppRoutes['BODEM/LOOD_METING'],
};

const tableConfigBase = {
  sort: dateSort('dateRequest', 'desc'),
};

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    ...tableConfigBase,
    title: 'Lopende aanvragen',
    filter: (bodemAanvraag: LoodMetingFrontend) => !bodemAanvraag.processed,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: withOmitDisplayPropsForSmallScreens(
      {
        detailLinkComponent: 'Adres',
        datumAanvraagFormatted: 'Aangevraagd op',
        status: 'Status',
      },
      ['status', 'datumAanvraagFormatted']
    ),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  },
  [listPageParamKind.completed]: {
    ...tableConfigBase,
    title: 'Afgehandelde aanvragen',
    filter: (bodemAanvraag: LoodMetingFrontend) => bodemAanvraag.processed,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.completed,
      page: null,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    displayProps: withOmitDisplayPropsForSmallScreens(
      {
        detailLinkComponent: 'Adres',
        datumAfgehandeldFormatted: 'Afgehandeld op',
        status: 'Resultaat',
      },
      ['status', 'datumAfgehandeldFormatted']
    ),
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over lood in de bodem.',
    to: 'https://www.amsterdam.nl/wonen-leefomgeving/bodem/lood-grond/',
  },
] as const;
