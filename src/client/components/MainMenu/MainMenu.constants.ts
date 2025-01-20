import { LinkProps, generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { Thema } from '../../../universal/config/thema';
import { ThemaMenuItem, ThemaTitles } from '../../config/thema';

type MainMenuId = Thema | 'MIJN_THEMAS';

export interface MenuItem extends LinkProps {
  id: MainMenuId;
  submenuItems?: ThemaMenuItem[];
  profileTypes?: ProfileType[];
}

export const categoryMenuItems: MenuItem[] = [
  {
    title: ThemaTitles.HOME,
    id: 'HOME',
    to: AppRoutes.HOME,
  },
  {
    title: ThemaTitles.BUURT,
    id: 'BUURT',
    to: generatePath(AppRoutes.BUURT),
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.NOTIFICATIONS,
    id: 'NOTIFICATIONS',
    to: generatePath(AppRoutes.NOTIFICATIONS),
  },
];
