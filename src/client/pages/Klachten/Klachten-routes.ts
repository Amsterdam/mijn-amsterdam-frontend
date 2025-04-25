import { KlachtenThemaPagina } from './Klachten';
import { KlachtenDetailPagina } from './KlachtenDetail';
import { KlachtenLijstPagina } from './KlachtenLijst';

export const KlachtenRoutes = [
  { route: '/klachten/lijst/:page?', Component: KlachtenLijstPagina },
  { route: '/klachten/klacht/:id', Component: KlachtenDetailPagina },
  { route: '/klachten', Component: KlachtenThemaPagina },
];
