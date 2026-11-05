import { generatePath } from 'react-router';

import { MyTipsPage } from './MyTips.tsx';
import { themaConfig, themaId, themaTitle } from './MyTips-config.ts';

export const MyTipsRoute = {
  route: '/alle-tips/:page?',
  isActive: themaConfig.featureToggle.enableNewTipsDesign,
  Component: MyTipsPage,
};

export const MyTipsRoutes = [MyTipsRoute];

export const myTipsMenuItem = {
  title: themaTitle,
  id: themaId,
  to: generatePath(MyTipsRoute.route),
};
