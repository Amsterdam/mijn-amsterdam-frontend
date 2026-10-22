import { dashboardMenuItem } from '../../apps/bob/pages/Dashboard/Dashboard-routes.ts';
import { myNotificationsMenuItem } from '../../apps/bob/pages/MyNotifications/MyNotifications-routes.ts';
import { myTipsMenuItem } from '../../apps/bob/pages/MyTips/MyTips-routes.ts';
import { menuCategoryItem as buurtMenuItem } from '../MyArea/MyArea-routes.ts';

export const categoryMenuItems = [
  buurtMenuItem,
  myNotificationsMenuItem,
  myTipsMenuItem,
  dashboardMenuItem,
] as const;
