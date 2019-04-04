import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';

const INITIAL_STATE = { items: [], total: 0, offset: 0, limit: 3 };

export default (offset = INITIAL_STATE.offset, limit = INITIAL_STATE.limit) => {
  const options = {
    url: ApiUrls.MIJN_UPDATES,
    params: { offset, limit },
  };
  const api = useDataApi(options, INITIAL_STATE);

  return {
    ...api,
    refetch: ({
      offset = INITIAL_STATE.offset,
      limit = INITIAL_STATE.limit,
    } = {}) => {
      api.refetch({ ...options, params: { offset, limit } });
    },
  };
};
