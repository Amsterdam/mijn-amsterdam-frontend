import { AppRoutes } from 'App.constants';
import { ReactComponent as BurgerzakenIcon } from 'assets/images/burgerzaken.svg';
import { ReactComponent as GezondheidIcon } from 'assets/images/gezondheid.svg';
import { ReactComponent as WonenIcon } from 'assets/images/wonen.svg';
import { ReactComponent as InkomenIcon } from 'assets/images/inkomen.svg';
import { ReactComponent as BelastingenIcon } from 'assets/images/belastingen.svg';

export const MyChaptersMenuItems = [
  {
    label: 'Burgerzaken',
    id: 'burgerzaken',
    to: AppRoutes.BURGERZAKEN,
    Icon: BurgerzakenIcon,
  },
  {
    label: 'Gezondheid',
    id: 'gezondhied',
    to: AppRoutes.GEZONDHEID,
    Icon: GezondheidIcon,
  },
  {
    label: 'Wonen',
    id: 'wonen',
    to: AppRoutes.WONEN,
    Icon: WonenIcon,
  },
  {
    label: 'Inkomen',
    id: 'inkomen',
    to: AppRoutes.INKOMEN,
    Icon: InkomenIcon,
  },
  {
    label: 'Belastingen',
    id: 'belastingen',
    to: AppRoutes.BELASTINGEN,
    Icon: BelastingenIcon,
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
