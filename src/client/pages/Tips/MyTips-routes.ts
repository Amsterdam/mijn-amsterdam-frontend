import { MyTipsPage } from './MyTips.tsx';
import { featureToggle } from './tips-config.ts';

export const MyTipsRoute = {
  route: '/alle-tips/:page?',
  isActive: featureToggle.newTipsDesign,
  Component: MyTipsPage,
};

export const MyTipsRoutes = [MyTipsRoute];
