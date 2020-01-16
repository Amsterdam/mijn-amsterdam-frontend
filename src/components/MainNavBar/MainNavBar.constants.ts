import {
  AppRoutes,
  Chapter,
  Chapters,
  ChapterTitles,
  ExternalUrls,
} from 'App.constants';
import { LinkProps } from 'App.types';
import { ReactComponent as BelastingenIcon } from 'assets/icons/belastingen.svg';
import { ReactComponent as BurgerzakenIcon } from 'assets/icons/burgerzaken.svg';
import { ReactComponent as IconGarbage } from 'assets/icons/Huisvuilkalender.svg';
import { ReactComponent as InkomenIcon } from 'assets/icons/inkomen.svg';
import { ReactComponent as JeugdhulpIcon } from 'assets/icons/Passport.svg';
import { ReactComponent as WonenIcon } from 'assets/icons/wonen.svg';
import { ReactComponent as ZorgIcon } from 'assets/icons/zorg.svg';
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
  MY_NOTIFICATIONS: 'MIJN_MELDINGEN',
};

export const myChaptersMenuItems: MenuItem[] = [
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    Icon: BelastingenIcon,
    rel: 'external',
  },
  {
    title: ChapterTitles.BURGERZAKEN,
    id: Chapters.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
    Icon: BurgerzakenIcon,
  },
  {
    title: ChapterTitles.WONEN,
    id: Chapters.WONEN,
    to: ExternalUrls.SSO_ERFPACHT || '',
    Icon: WonenIcon,
    rel: 'external',
  },
  {
    title: ChapterTitles.ZORG,
    id: Chapters.ZORG,
    to: AppRoutes.ZORG,
    Icon: ZorgIcon,
  },
  {
    title: ChapterTitles.INKOMEN,
    id: Chapters.INKOMEN,
    to: AppRoutes.INKOMEN,
    Icon: InkomenIcon,
  },
  {
    title: ChapterTitles.JEUGDHULP,
    id: Chapters.JEUGDHULP,
    to: AppRoutes.JEUGDHULP,
    Icon: JeugdhulpIcon,
  },
  {
    title: ChapterTitles.AFVAL,
    id: Chapters.AFVAL,
    to: AppRoutes.AFVAL,
    Icon: IconGarbage,
  },
];

export const MenuItemTitles = {
  HOME: ChapterTitles.ROOT,
  MY_CHAPTERS: "Mijn thema's",
  MY_AREA: ChapterTitles.MIJN_BUURT,
  MY_NOTIFICATIONS: ChapterTitles.MELDINGEN,
};

export const mainMenuItems: MenuItem[] = [
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
    title: MenuItemTitles.MY_NOTIFICATIONS,
    id: mainMenuItemId.MY_NOTIFICATIONS,
    to: AppRoutes.MY_NOTIFICATIONS,
  },
];

export const submenuItems: { [id: string]: MenuItem[] } = {
  [mainMenuItemId.MY_CHAPTERS]: myChaptersMenuItems,
};
