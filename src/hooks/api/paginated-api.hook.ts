import { useDataApi } from './api.hook';
import { Unshaped } from 'App.types';

export interface PaginatedItemsState {
  items: Unshaped[];
  total: number;
  offset: number;
  limit: number;
}

const INITIAL_STATE: PaginatedItemsState = {
  items: [],
  total: 0,
  offset: 0,
  limit: 3,
};

export default function paginatedApi(
  url: string,
  offset: number = INITIAL_STATE.offset,
  limit: number = INITIAL_STATE.limit
) {
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
}
