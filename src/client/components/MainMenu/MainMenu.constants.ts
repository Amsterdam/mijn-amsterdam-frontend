import { dashboardMenuItem } from '../../pages/Dashboard/Dashboard-routes.ts';
import { myNotificationsMenuItem } from '../../pages/MyNotifications/MyNotifications-routes.ts';
import { menuCategoryItem as buurtMenuItem } from '../MyArea/MyArea-routes.ts';

export const categoryMenuItems = [
  buurtMenuItem,
  myNotificationsMenuItem,
  dashboardMenuItem,
] as const;
