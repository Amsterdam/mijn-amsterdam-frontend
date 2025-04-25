import { generatePath } from 'react-router';

import { AppRoutes } from '../../../universal/config/routes';
import { ThemaTitles } from '../../config/thema';
import { menuCategoryItem as buurtMenuItem } from '../MyArea/MyArea-routes';

export const categoryMenuItems = [
  {
    title: ThemaTitles.HOME,
    id: 'HOME',
    to: AppRoutes.HOME,
  },
  buurtMenuItem,
  {
    title: ThemaTitles.NOTIFICATIONS,
    id: 'NOTIFICATIONS',
    to: generatePath(AppRoutes.NOTIFICATIONS),
  },
] as const;
