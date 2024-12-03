import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';

export const displayPropsAanvragen = {
  detailLinkComponent: 'Adres',
  datumAanvraagFormatted: 'Aangevraagd',
  status: 'Status',
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
    filter: (bodemAanvraag: LoodMeting) => !bodemAanvraag.datumAfgehandeld,
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (bodemAanvraag: LoodMeting) => bodemAanvraag.datumAfgehandeld,
    ...tableConfigBase,
  },
};

export const linkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over lood in de bodem.',
    to: 'https://www.amsterdam.nl/wonen-leefomgeving/bodem/lood-grond/',
  },
];
