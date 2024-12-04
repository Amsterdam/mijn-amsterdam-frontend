import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

export const displayPropsAanvragen: DisplayProps<
  WithDetailLinkComponent<AVGRequestFrontend>
> = {
  detailLinkComponent: 'Nummer',
  ontvangstDatumFormatted: 'Ontvangen op',
  themas: 'Onderwerp(en)',
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
    filter: (avgVerzoek: AVGRequestFrontend) => !avgVerzoek.datumAfhandeling,
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => avgVerzoek.datumAfhandeling,
    ...tableConfigBase,
  },
};

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/privacy/loket/',
    title: 'Loket persoonsgegevens gemeente Amsterdam',
  },
];
