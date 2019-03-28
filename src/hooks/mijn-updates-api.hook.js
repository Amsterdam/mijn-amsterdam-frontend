import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';

export const useMijnUpdatesApi = (offset = 0, limit = 3) => {
  const options = { url: ApiUrls.MIJN_UPDATES, params: { offset, limit } };
  const api = useDataApi(options, { items: [], total: 0, offset, limit });

  return {
    data: api.data,
    refetch: page => api.refetch({ ...options, params: { offset, limit } }),
  };
};
