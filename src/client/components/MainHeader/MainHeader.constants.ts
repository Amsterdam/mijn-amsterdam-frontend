import { generatePath } from 'react-router-dom';
import {
  AppRoutes,
  Thema,
  ThemaMenuItem,
  ThemaTitles,
} from '../../../universal/config';
import { LinkProps } from '../../../universal/types';

type MainMenuId = Thema | 'MIJN_THEMAS';

export interface MenuItem extends LinkProps {
  id: MainMenuId;
  submenuItems?: ThemaMenuItem[];
  profileTypes?: ProfileType[];
}

export const mainMenuItemId: { [key: string]: MainMenuId } = {
  HOME: 'DASHBOARD',
  THEMAS: 'MIJN_THEMAS',
  BUURT: 'BUURT',
  NOTIFICATIONS: 'NOTIFICATIONS',
};

export const MenuItemTitles = {
  HOME: ThemaTitles.ROOT,
  THEMAS: "Mijn thema's",
  BUURT: ThemaTitles.BUURT,
  NOTIFICATIONS: ThemaTitles.NOTIFICATIONS,
};

export const mainMenuItems: MenuItem[] = [
  {
    title: MenuItemTitles.HOME,
    id: mainMenuItemId.HOME,
    to: AppRoutes.ROOT,
  },
  {
    title: MenuItemTitles.THEMAS,
    id: mainMenuItemId.THEMAS,
    to: '',
  },
  {
    title: MenuItemTitles.BUURT,
    id: mainMenuItemId.BUURT,
    to: generatePath(AppRoutes.BUURT),
    profileTypes: ['private', 'commercial'],
  },
  {
    title: MenuItemTitles.NOTIFICATIONS,
    id: mainMenuItemId.NOTIFICATIONS,
    to: generatePath(AppRoutes.NOTIFICATIONS),
  },
];

export function isMenuItemVisible(
  profileType: ProfileType,
  menuItem: MenuItem
) {
  if (Array.isArray(menuItem.profileTypes)) {
    return menuItem.profileTypes.includes(profileType);
  }
  return true;
}
