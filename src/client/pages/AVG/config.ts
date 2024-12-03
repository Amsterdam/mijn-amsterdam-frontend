import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { dateSort } from '../../../universal/helpers/date';
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

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => !avgVerzoek.datumAfhandeling,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsAanvragen,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => avgVerzoek.datumAfhandeling,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsAanvragen,
  },
};
