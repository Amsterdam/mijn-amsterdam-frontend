import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { dateSort } from '../../../universal/helpers/date';

export const displayPropsAanvragen = {
  detailLinkComponent: 'Adres',
  datumAanvraagFormatted: 'Aangevraagd',
  status: 'Status',
};

export const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
};

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (bodemAanvraag: LoodMetingFrontend) =>
      !bodemAanvraag.datumAfgehandeld,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsAanvragen,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (bodemAanvraag: LoodMetingFrontend) =>
      bodemAanvraag.datumAfgehandeld,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsAanvragen,
  },
};
