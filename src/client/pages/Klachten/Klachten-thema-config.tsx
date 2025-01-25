import { Klacht } from '../../../server/services/klachten/types';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types/App.types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND = 5;

export const LinkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over de afhandeling van uw klacht',
    to: 'https://www.amsterdam.nl/veelgevraagd/klacht-indienen-over-de-gemeente-42fd5#case_%7B9846AD0A-E989-4B5D-A1D3-6D79E34DF1BE%7D',
  },
];

const displayPropsKlachten: DisplayProps<WithDetailLinkComponent<Klacht>> = {
  detailLinkComponent: 'Nummer van uw klacht',
  ontvangstDatumFormatted: 'Ontvangen op',
  onderwerp: 'Onderwerp',
};

export const routes = {
  listPage: AppRoutes['KLACHTEN/LIST'],
  detailPageVergunning: AppRoutes['KLACHTEN/KLACHT'],
  themaPage: AppRoutes.KLACHTEN,
} as const;

export const klachtenTableConfig = {
  title: 'Ingediende klachten',
  displayProps: displayPropsKlachten,
  maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  listPageRoute: routes.listPage,
} as const;
