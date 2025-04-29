import { routeConfig, themaId, themaTitle } from './MyArea-thema-config';
import { MyAreaLoader } from './MyAreaLoader';
import { CategoryMenuItem } from '../../config/thema-types';

export const MyAreaRoutes = [
  { route: routeConfig.themaPage.path, Component: MyAreaLoader },
];

export const menuCategoryItem: CategoryMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
};
