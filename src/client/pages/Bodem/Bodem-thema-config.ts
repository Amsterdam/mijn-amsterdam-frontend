import { generatePath } from 'react-router-dom';

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

const displayPropsAanvragenBase: DisplayProps<
  WithDetailLinkComponent<LoodMetingFrontend>
> = {
  detailLinkComponent: 'Adres',
  datumAanvraagFormatted: 'Aangevraagd',
  status: 'Status',
};

const displayPropsAanvragen = withOmitDisplayPropsForSmallScreens(
  displayPropsAanvragenBase,
  ['status', 'datumAanvraagFormatted']
);

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
  displayProps: displayPropsAanvragen,
};

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    ...tableConfigBase,
    title: 'Lopende aanvragen',
    filter: (bodemAanvraag: LoodMetingFrontend) => !bodemAanvraag.processed,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.inProgress,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  },
  [listPageParamKind.completed]: {
    ...tableConfigBase,
    title: 'Afgehandelde aanvragen',
    filter: (bodemAanvraag: LoodMetingFrontend) => bodemAanvraag.processed,
     listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.completed,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over lood in de bodem.',
    to: 'https://www.amsterdam.nl/wonen-leefomgeving/bodem/lood-grond/',
  },
] as const;
