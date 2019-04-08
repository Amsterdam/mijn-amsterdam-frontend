import { AppRoutes } from 'App.constants';
import { ReactComponent as BurgerzakenIcon } from 'assets/images/burgerzaken.svg';
import { ReactComponent as ZorgIcon } from 'assets/images/zorg.svg';
import { ReactComponent as WonenIcon } from 'assets/images/wonen.svg';
import { ReactComponent as InkomenIcon } from 'assets/images/inkomen.svg';
import { ReactComponent as BelastingenIcon } from 'assets/images/belastingen.svg';
import { ReactComponent as JeugdhulpIcon } from 'assets/icons/Passport.svg';

export const MyChaptersMenuItems = [
  {
    label: 'Burgerzaken',
    id: 'burgerzaken',
    to: AppRoutes.BURGERZAKEN,
    Icon: BurgerzakenIcon,
  },
  {
    label: 'Wonen',
    id: 'wonen',
    to: AppRoutes.WONEN,
    Icon: WonenIcon,
  },
  {
    label: 'Belastingen',
    id: 'belastingen',
    to: AppRoutes.BELASTINGEN,
    Icon: BelastingenIcon,
  },
  {
    label: 'Zorg',
    id: 'gezondhied',
    to: AppRoutes.ZORG,
    Icon: ZorgIcon,
  },
  {
    label: 'Inkomen',
    id: 'inkomen',
    to: AppRoutes.INKOMEN,
    Icon: InkomenIcon,
  },
  {
    label: 'Jeugdhulp',
    id: 'jeugdhulp',
    to: AppRoutes.JEUGDHULP,
    Icon: JeugdhulpIcon,
  },
];

export const MenuConfig = [
  {
    label: 'Home',
    id: 'home',
    to: AppRoutes.ROOT,
  },
  {
    label: "Mijn thema's",
    id: 'mijn-themas',
    to: AppRoutes.MIJN_THEMAS,
    submenuItems: MyChaptersMenuItems,
  },
  { label: 'Mijn buurt', id: 'mijn-buurt', to: AppRoutes.MIJN_BUURT },
  { label: 'Mijn updates', id: 'mijn-updates', to: AppRoutes.MY_UPDATES },
];
