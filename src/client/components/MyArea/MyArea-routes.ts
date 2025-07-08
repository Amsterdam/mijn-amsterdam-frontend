import { routeConfig, themaId, themaTitle } from './MyArea-thema-config.ts';
import { MyAreaLoader } from './MyAreaLoader.tsx';
import { CategoryMenuItem } from '../../config/thema-types.ts';

export const MyAreaRoutes = [
  { route: routeConfig.themaPage.path, Component: MyAreaLoader },
];

export const menuCategoryItem: CategoryMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
};
