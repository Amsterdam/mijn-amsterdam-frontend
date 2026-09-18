import { generatePath } from 'react-router';

import { featureToggle, themaTitle, themaId } from './MyTips-config.ts';
import { MyTipsPage } from './MyTips.tsx';

export const MyTipsRoute = {
  route: '/alle-tips/:page?',
  isActive: featureToggle.newTipsDesign,
  Component: MyTipsPage,
};

export const MyTipsRoutes = [MyTipsRoute];

export const myTipsMenuItem = {
  title: themaTitle,
  id: themaId,
  to: generatePath(MyTipsRoute.route),
};
