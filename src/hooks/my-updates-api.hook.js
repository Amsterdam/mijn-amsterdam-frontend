import { ApiUrls } from 'App.constants';
import paginatedApiHook from './paginated-api.hook';
import { Labels } from './my-cases-api.hook';
// export default (offset, limit) => {
//   return paginatedApiHook(ApiUrls.MY_UPDATES, offset, limit);
// };

export default (offset, limit) => {
  const api = paginatedApiHook(ApiUrls.FOCUS, offset, limit);

  // NOTE: Temporary take data from focus api
  const items = !(api.data && api.data.items)
    ? Object.values(api.data)
        .filter(
          item =>
            !(item && item.processtappen && item.processtappen.inBehandeling)
        )
        .map(item => {
          const latestType = item._meest_recent;
          const datePublished = item.processtappen[latestType].datum;
          return {
            chapter: 'INKOMEN',
            datePublished,
            title: Labels[item.soortProduct][latestType].label,
            description: Labels[item.soortProduct][latestType].title,
            link: {
              to: '/inkomen',
              label: 'bekijk item',
            },
          };
        })
    : [];
  return { ...api, data: { items, total: items.length } };
};
