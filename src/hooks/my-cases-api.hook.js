import { ApiUrls } from 'App.constants';
import paginatedApiHook from './paginated-api.hook';

export default (offset, limit) => {
  const api = paginatedApiHook(ApiUrls.FOCUS, offset, limit);

  // NOTE: Temporary take data from focus api
  const items = api.data.items.map(item => {
    const latestType = item._meest_recent;
    const dateModified = item.processtappen[latestType].datum;
    return {
      chapter: 'INKOMEN',
      dateModified,
      title: item.naam,
      to: '/inkomen',
    };
  });
  return { ...api, data: { items } };
};
