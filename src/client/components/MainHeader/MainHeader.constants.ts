import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { Thema } from '../../../universal/config/thema';
import { LinkProps } from '../../../universal/types';
import { ThemaMenuItem, ThemaTitles } from '../../config/thema';

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

export const mainMenuItems: MenuItem[] = [
  {
    title: ThemaTitles.ROOT,
    id: mainMenuItemId.HOME,
    to: AppRoutes.ROOT,
  },
  {
    title: ThemaTitles.BUURT,
    id: mainMenuItemId.BUURT,
    to: generatePath(AppRoutes.BUURT),
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.NOTIFICATIONS,
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
