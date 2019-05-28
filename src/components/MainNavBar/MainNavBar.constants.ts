import { AppRoutes, Chapters, Chapter, ExternalUrls } from 'App.constants';
import { ReactComponent as BurgerzakenIcon } from 'assets/images/burgerzaken.svg';
import { ReactComponent as ZorgIcon } from 'assets/images/zorg.svg';
import { ReactComponent as WonenIcon } from 'assets/images/wonen.svg';
import { ReactComponent as InkomenIcon } from 'assets/images/inkomen.svg';
import { ReactComponent as BelastingenIcon } from 'assets/images/belastingen.svg';
import { ReactComponent as JeugdhulpIcon } from 'assets/icons/Passport.svg';
import { LinkProps, SVGComponent } from 'App.types';

export type MainMenuId =
  | Chapter
  | 'home'
  | 'my-chapters'
  | 'my-area'
  | 'my-updates';

export interface MenuItem extends LinkProps {
  id: MainMenuId;
  Icon?: SVGComponent;
  submenuItems?: MenuItem[];
  isLoading?: boolean;
}

export const mainMenuItemId: { [key: string]: MainMenuId } = {
  HOME: 'home',
  MY_CHAPTERS: 'my-chapters',
  MY_AREA: 'my-area',
  MY_UPDATES: 'my-updates',
};

export const myChaptersMenuItems: MenuItem[] = [
  {
    title: 'Burgerzaken',
    id: Chapters.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
    Icon: BurgerzakenIcon,
  },
  {
    title: 'Erfpacht',
    id: Chapters.WONEN,
    to: ExternalUrls.ERFPACHT || AppRoutes.WONEN,
    Icon: WonenIcon,
    target: '_self',
  },
  {
    title: 'Belastingen',
    id: Chapters.BELASTINGEN,
    to: AppRoutes.BELASTINGEN,
    Icon: BelastingenIcon,
  },
  {
    title: 'Zorg',
    id: Chapters.ZORG,
    to: AppRoutes.ZORG,
    Icon: ZorgIcon,
  },
  {
    title: 'Werk & inkomen',
    id: Chapters.INKOMEN,
    to: AppRoutes.INKOMEN,
    Icon: InkomenIcon,
  },
  {
    title: 'Jeugdhulp',
    id: Chapters.JEUGDHULP,
    to: AppRoutes.JEUGDHULP,
    Icon: JeugdhulpIcon,
  },
];

export const MenuItemTitles = {
  HOME: 'Home',
  MY_CHAPTERS: "Mijn thema's",
  MY_AREA: 'Mijn buurt',
  MY_UPDATES: 'Mijn meldingen',
};

export const menuItems: MenuItem[] = [
  {
    title: MenuItemTitles.HOME,
    id: mainMenuItemId.HOME,
    to: AppRoutes.ROOT,
  },
  {
    title: MenuItemTitles.MY_CHAPTERS,
    id: mainMenuItemId.MY_CHAPTERS,
    to: '',
  },
  {
    title: MenuItemTitles.MY_AREA,
    id: mainMenuItemId.MY_AREA,
    to: AppRoutes.MY_AREA,
  },
  {
    title: MenuItemTitles.MY_UPDATES,
    id: mainMenuItemId.MY_UPDATES,
    to: AppRoutes.MY_UPDATES,
  },
];

export const submenuItems: { [id: string]: MenuItem[] } = {
  [mainMenuItemId.MY_CHAPTERS]: myChaptersMenuItems,
};
