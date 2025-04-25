import { generatePath } from 'react-router';

import { MyNotificationsPage } from './MyNotifications';
import { themaId, themaTitle } from './MyNotifications-config';

export const MyNotificationsRoute = {
  route: '/overzicht-updates/:page?',
  Component: MyNotificationsPage,
};

export const MyNotificationsRoutes = [MyNotificationsRoute];

export const myNotificationsMenuItem = {
  title: themaTitle,
  id: themaId,
  to: generatePath(MyNotificationsRoute.route),
};
