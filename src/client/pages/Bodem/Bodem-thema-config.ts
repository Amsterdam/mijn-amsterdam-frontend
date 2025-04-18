import { generatePath } from 'react-router';

import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
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

const displayPropsLopend = withOmitDisplayPropsForSmallScreens<
  DisplayProps<WithDetailLinkComponent<LoodMetingFrontend>>
>(
  {
    detailLinkComponent: 'Adres',
    datumAanvraagFormatted: 'Aangevraagd op',
    displayStatus: 'Status',
  },
  ['displayStatus', 'datumAanvraagFormatted']
);

const displayPropsEerder = withOmitDisplayPropsForSmallScreens<
  DisplayProps<WithDetailLinkComponent<LoodMetingFrontend>>
>(
  {
    detailLinkComponent: 'Adres',
    datumAfgehandeldFormatted: 'Afgehandeld op',
    decision: 'Resultaat',
  },
  ['decision', 'datumAfgehandeldFormatted']
);

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAanvraag', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => !bodemAanvraag.processed,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: displayPropsLopend,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAfgehandeld', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => bodemAanvraag.processed,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.completed,
      page: null,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    displayProps: displayPropsEerder,
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over lood in de bodem.',
    to: 'https://www.amsterdam.nl/wonen-leefomgeving/bodem/lood-grond/',
  },
] as const;
