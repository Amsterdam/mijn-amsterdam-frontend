import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { dateSort } from '../../../universal/helpers/date';

export const displayPropsAanvragen = {
  idAsLink: 'Nummer',
  ontvangstDatum: 'Ontvangen op',
  themaString: 'Onderwerp',
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
