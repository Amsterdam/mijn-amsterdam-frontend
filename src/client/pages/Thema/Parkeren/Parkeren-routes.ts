import { Parkeren } from './Parkeren';
import { ParkerenDetailPagina } from './ParkerenDetail';
import { ParkerenList } from './ParkerenList';

export const ParkerenRoutes = [
  { route: '/parkeren/lijst/:kind/:page?', Component: ParkerenList },
  { route: '/parkeren/:caseType/:id', Component: ParkerenDetailPagina },
  { route: '/parkeren', Component: Parkeren },
];
