import { Burgerzaken } from './Burgerzaken';
import { BurgerzakenIdentiteitsbewijs } from './BurgerzakenIdentiteitsbewijs';
import { BurgerZakenList } from './BurgerZakenList';

export const BurgerzakenRoutes = [
  {
    route: '/paspoort-en-id-kaart/lijst/:kind/:page?',
    Component: BurgerZakenList,
  },
  {
    route: '/paspoort-en-id-kaart/:documentType/:id',
    Component: BurgerzakenIdentiteitsbewijs,
  },
  { route: '/paspoort-en-id-kaart', Component: Burgerzaken },
];
