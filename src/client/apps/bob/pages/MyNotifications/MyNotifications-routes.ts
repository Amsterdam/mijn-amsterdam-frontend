import { generatePath } from 'react-router';

import { MyNotificationsPage } from './MyNotifications.tsx';
import { themaId, themaTitle } from './MyNotifications-config.ts';

export const MyNotificationsRoute = {
  route: '/alle-berichten/:page?',
  Component: MyNotificationsPage,
};

export const MyNotificationsRoutes = [MyNotificationsRoute];

export const myNotificationsMenuItem = {
  title: themaTitle,
  id: themaId,
  to: generatePath(MyNotificationsRoute.route),
};
