import { useDataApi } from './api.hook';

const INITIAL_STATE = { items: [], total: 0, offset: 0, limit: 3 };

export default (
  url,
  offset = INITIAL_STATE.offset,
  limit = INITIAL_STATE.limit
) => {
  const options = {
    url,
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
