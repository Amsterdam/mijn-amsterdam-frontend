import { useDataApi } from './api.hook';
import { format } from 'date-fns';
import { ApiUrls, DEFAULT_DATE_FORMAT } from 'App.constants';

export const useMijnUpdatesApi = (offset = 0, limit = 3) => {
  const options = { url: ApiUrls.MIJN_UPDATES, params: { offset, limit } };
  const api = useDataApi(options, []);

  return {
    data: api.data.map(update => {
      return {
        ...update,
        datePublished: format(update.dateCreated, DEFAULT_DATE_FORMAT),
      };
    }),
    refetch: page => api.refetch({ ...options, params: { offset, limit } }),
  };
};
