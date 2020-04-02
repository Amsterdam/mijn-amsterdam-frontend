import { AppRoutes, Chapter, ChapterTitles } from '../../../universal/config';
import { MenuItem, myChaptersMenuItems } from '../../config/menuItems';

export type MainMenuId =
  | Chapter
  | 'DASHBOARD'
  | 'MIJN_THEMAS'
  | 'MIJN_BUURT'
  | 'MIJN_UPDATES';

export const mainMenuItemId: { [key: string]: MainMenuId } = {
  HOME: 'DASHBOARD',
  MY_CHAPTERS: 'MIJN_THEMAS',
  MIJN_BUURT: 'MIJN_BUURT',
  UPDATES: 'MIJN_UPDATES',
};

export const MenuItemTitles = {
  HOME: ChapterTitles.ROOT,
  MY_CHAPTERS: "Mijn thema's",
  MIJN_BUURT: ChapterTitles.MIJN_BUURT,
  UPDATES: ChapterTitles.UPDATES,
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
    title: MenuItemTitles.MIJN_BUURT,
    id: mainMenuItemId.MIJN_BUURT,
    to: AppRoutes.MIJN_BUURT,
  },
  {
    title: MenuItemTitles.UPDATES,
    id: mainMenuItemId.UPDATES,
    to: AppRoutes.UPDATES,
  },
];

export const submenuItems: { [id: string]: MenuItem[] } = {
  [mainMenuItemId.MY_CHAPTERS]: myChaptersMenuItems,
};
