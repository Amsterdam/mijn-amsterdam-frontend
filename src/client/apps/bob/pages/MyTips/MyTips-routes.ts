import { featureToggle } from './MyTips-config.ts';
import { MyTipsPage } from './MyTips.tsx';

export const MyTipsRoute = {
  route: '/alle-tips/:page?',
  isActive: featureToggle.newTipsDesign,
  Component: MyTipsPage,
};

export const MyTipsRoutes = [MyTipsRoute];
