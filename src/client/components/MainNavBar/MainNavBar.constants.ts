import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapter, ChapterTitles } from '../../../universal/config';
import { LinkProps } from '../../../universal/types';
import { ChapterMenuItem } from '../../config/menuItems';

type MainMenuId =
  | Chapter
  | 'DASHBOARD'
  | 'MIJN_THEMAS'
  | 'BUURT'
  | 'NOTIFICATIONS';

export interface MenuItem extends LinkProps {
  id: MainMenuId;
  submenuItems?: ChapterMenuItem[];
}

export const mainMenuItemId: { [key: string]: MainMenuId } = {
  HOME: 'DASHBOARD',
  CHAPTERS: 'MIJN_THEMAS',
  BUURT: 'BUURT',
  NOTIFICATIONS: 'NOTIFICATIONS',
};

export const MenuItemTitles = {
  HOME: ChapterTitles.ROOT,
  CHAPTERS: "Mijn thema's",
  BUURT: ChapterTitles.BUURT,
  NOTIFICATIONS: ChapterTitles.NOTIFICATIONS,
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
    title: MenuItemTitles.NOTIFICATIONS,
    id: mainMenuItemId.NOTIFICATIONS,
    to: generatePath(AppRoutes.NOTIFICATIONS),
  },
];
