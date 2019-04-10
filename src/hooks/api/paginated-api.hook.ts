import { useDataApi } from './api.hook';
import { ApiHookState } from './api.types';

export interface PaginatedItemsResponse {
  items: any[];
  total: number;
  offset: number;
  limit: number;
}

export interface PaginatedApiState extends ApiHookState {
  data: PaginatedItemsResponse;
  refetch: (options: { offset?: number; limit?: number }) => void;
}

const INITIAL_STATE: PaginatedItemsResponse = {
  items: [],
  total: 0,
  offset: 0,
  limit: 3,
};

export default function paginatedApi(
  url: string,
  offset: number = INITIAL_STATE.offset,
  limit: number = INITIAL_STATE.limit
): PaginatedApiState {
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
