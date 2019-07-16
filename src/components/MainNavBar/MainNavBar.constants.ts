import { AppRoutes, Chapter, Chapters, ExternalUrls } from 'App.constants';
import { LinkProps } from 'App.types';
import { ReactComponent as JeugdhulpIcon } from 'assets/icons/Passport.svg';
import { ReactComponent as BelastingenIcon } from 'assets/images/belastingen.svg';
import { ReactComponent as BurgerzakenIcon } from 'assets/images/burgerzaken.svg';
import { ReactComponent as InkomenIcon } from 'assets/images/inkomen.svg';
import { ReactComponent as WonenIcon } from 'assets/images/wonen.svg';
import { ReactComponent as ZorgIcon } from 'assets/images/zorg.svg';
import { FunctionComponent, SVGProps } from 'react';

export type MainMenuId =
  | Chapter
  | 'DASHBOARD'
  | 'MIJN_THEMAS'
  | 'MIJN_BUURT'
  | 'MIJN_MELDINGEN';

export interface MenuItem extends LinkProps {
  id: MainMenuId;
  Icon?: FunctionComponent<SVGProps<SVGSVGElement>>;
  submenuItems?: MenuItem[];
  isLoading?: boolean;
}

export const mainMenuItemId: { [key: string]: MainMenuId } = {
  HOME: 'DASHBOARD',
  MY_CHAPTERS: 'MIJN_THEMAS',
  MY_AREA: 'MIJN_BUURT',
  MY_UPDATES: 'MIJN_MELDINGEN',
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
    to: ExternalUrls.SSO_ERFPACHT || '',
    Icon: WonenIcon,
    rel: 'external',
  },
  {
    title: 'Belastingen',
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    Icon: BelastingenIcon,
    rel: 'external',
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
