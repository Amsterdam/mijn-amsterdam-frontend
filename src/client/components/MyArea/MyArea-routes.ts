import { routeConfig, themaId, themaTitle } from './MyArea-thema-config';
import { CategoryMenuItem } from '../../config/thema-types';

export const menuCategoryItem: CategoryMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private', 'commercial'],
};
