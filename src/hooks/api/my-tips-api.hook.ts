import { ApiUrls } from 'App.constants';
import paginatedApiHook from './paginated-api.hook';

export default (offset?: number, limit?: number) => {
  return paginatedApiHook(ApiUrls.MY_TIPS, offset, limit);
};
