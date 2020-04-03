import { AppRoutes, Chapter, ChapterTitles } from '../../../universal/config';
import { MenuItem, myChaptersMenuItems } from '../../config/menuItems';

export type MainMenuId =
  | Chapter
  | 'DASHBOARD'
  | 'MIJN_THEMAS'
  | 'BUURT'
  | 'MIJN_UPDATES';

export const mainMenuItemId: { [key: string]: MainMenuId } = {
  HOME: 'DASHBOARD',
  CHAPTERS: 'MIJN_THEMAS',
  BUURT: 'BUURT',
  UPDATES: 'MIJN_UPDATES',
};

export const MenuItemTitles = {
  HOME: ChapterTitles.ROOT,
  CHAPTERS: "Mijn thema's",
  BUURT: ChapterTitles.BUURT,
  UPDATES: ChapterTitles.UPDATES,
};

export const mainMenuItems: MenuItem[] = [
  {
    title: MenuItemTitles.HOME,
    id: mainMenuItemId.HOME,
    to: AppRoutes.ROOT,
  },
  {
    title: MenuItemTitles.CHAPTERS,
    id: mainMenuItemId.CHAPTERS,
    to: '',
  },
  {
    title: MenuItemTitles.BUURT,
    id: mainMenuItemId.BUURT,
    to: AppRoutes.BUURT,
  },
  {
    title: MenuItemTitles.UPDATES,
    id: mainMenuItemId.UPDATES,
    to: AppRoutes.UPDATES,
  },
];

export const submenuItems: { [id: string]: MenuItem[] } = {
  [mainMenuItemId.CHAPTERS]: myChaptersMenuItems,
};
