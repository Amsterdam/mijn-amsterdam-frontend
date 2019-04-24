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
    title: 'Wonen',
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
    title: 'Inkomen',
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

export const menuItems: MenuItem[] = [
  {
    title: 'Home',
    id: mainMenuItemId.HOME,
    to: AppRoutes.ROOT,
  },
  {
    title: "Mijn thema's",
    id: mainMenuItemId.MY_CHAPTERS,
    to: '',
  },
  { title: 'Mijn buurt', id: mainMenuItemId.MY_AREA, to: AppRoutes.MY_AREA },
  {
    title: 'Mijn updates',
    id: mainMenuItemId.MY_UPDATES,
    to: AppRoutes.MY_UPDATES,
  },
];

export const submenuItems: { [id: string]: MenuItem[] } = {
  [mainMenuItemId.MY_CHAPTERS]: myChaptersMenuItems,
};
