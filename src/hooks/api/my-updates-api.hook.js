import { ApiUrls } from 'App.constants';
import paginatedApiHook from './paginated-api.hook';

export default (offset, limit) => {
  return paginatedApiHook(ApiUrls.MY_UPDATES, offset, limit);
};
