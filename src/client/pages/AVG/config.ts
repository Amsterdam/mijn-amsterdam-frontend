import { generatePath } from 'react-router-dom';

import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

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
    listPageRoute: generatePath(AppRoutes['AVG/LIST'], {
      kind: listPageParamKind.inProgress,
    }),
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => avgVerzoek.datumAfhandeling,
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
