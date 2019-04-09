import { AppRoutes } from 'App.constants';
import { ReactComponent as BurgerzakenIcon } from 'assets/images/burgerzaken.svg';
import { ReactComponent as ZorgIcon } from 'assets/images/zorg.svg';
import { ReactComponent as WonenIcon } from 'assets/images/wonen.svg';
import { ReactComponent as InkomenIcon } from 'assets/images/inkomen.svg';
import { ReactComponent as BelastingenIcon } from 'assets/images/belastingen.svg';
import { ReactComponent as JeugdhulpIcon } from 'assets/icons/Passport.svg';
import { LinkProps, SVGComponent } from 'App.types';

export interface MenuItem extends LinkProps {
  id: string;
  Icon?: SVGComponent;
  submenuItems?: MenuItem[];
}

export const myChaptersMenuItems: MenuItem[] = [
  {
    title: 'Burgerzaken',
    id: 'burgerzaken',
    to: AppRoutes.BURGERZAKEN,
    Icon: BurgerzakenIcon,
  },
  {
    title: 'Wonen',
    id: 'wonen',
    to: AppRoutes.WONEN,
    Icon: WonenIcon,
  },
  {
    title: 'Belastingen',
    id: 'belastingen',
    to: AppRoutes.BELASTINGEN,
    Icon: BelastingenIcon,
  },
  {
    title: 'Zorg',
    id: 'gezondhied',
    to: AppRoutes.ZORG,
    Icon: ZorgIcon,
  },
  {
    title: 'Inkomen',
    id: 'inkomen',
    to: AppRoutes.INKOMEN,
    Icon: InkomenIcon,
  },
  {
    title: 'Jeugdhulp',
    id: 'jeugdhulp',
    to: AppRoutes.JEUGDHULP,
    Icon: JeugdhulpIcon,
  },
];

export const menuItems: MenuItem[] = [
  {
    title: 'Home',
    id: 'home',
    to: AppRoutes.ROOT,
  },
  {
    title: "Mijn thema's",
    id: 'mijn-themas',
    to: '',
    submenuItems: myChaptersMenuItems,
  },
  { label: 'Mijn buurt', id: 'mijn-buurt', to: AppRoutes.MY_AREA },
  { label: 'Mijn updates', id: 'mijn-updates', to: AppRoutes.MY_UPDATES },
];
