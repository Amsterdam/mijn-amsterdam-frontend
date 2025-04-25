import { dashboardMenuItem } from '../../pages/Dashboard/Dashboard-routes';
import { myNotificationsMenuItem } from '../../pages/MyNotifications/MyNotifications-routes';
import { menuCategoryItem as buurtMenuItem } from '../MyArea/MyArea-routes';

export const categoryMenuItems = [
  buurtMenuItem,
  myNotificationsMenuItem,
  dashboardMenuItem,
] as const;
