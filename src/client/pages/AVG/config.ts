import { generatePath } from 'react-router-dom';

import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND = 5;

const displayPropsAanvragen: DisplayProps<
  WithDetailLinkComponent<AVGRequestFrontend>
> = {
  detailLinkComponent: 'Nummer',
  ontvangstDatumFormatted: 'Ontvangen op',
  themas: 'Onderwerp(en)',
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
    title: 'Lopende aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => !avgVerzoek.datumAfhandeling,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    listPageRoute: generatePath(AppRoutes['AVG/LIST'], {
      kind: listPageParamKind.inProgress,
    }),
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => avgVerzoek.datumAfhandeling,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(AppRoutes['AVG/LIST'], {
      kind: listPageParamKind.completed,
    }),
    ...tableConfigBase,
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/privacy/loket/',
    title: 'Loket persoonsgegevens gemeente Amsterdam',
  },
] as const;
