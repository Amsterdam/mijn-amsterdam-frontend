import { useDataApi } from './api.hook';
import { ApiState } from './api.types';

export interface PaginatedItemsResponse {
  items: any[];
  total: number;
  offset: number;
  limit: number;
}

export interface PaginatedApiState extends ApiState {
  data: PaginatedItemsResponse;
  refetch: (options: { offset?: number; limit?: number }) => void;
}

export const INITIAL_STATE: PaginatedItemsResponse = {
  items: [],
  total: 0,
  offset: 0,
  limit: 3,
};

export default function usePaginatedApi(
  url: string,
  offset: number = INITIAL_STATE.offset,
  limit: number = INITIAL_STATE.limit,
  postpone: boolean = false
): PaginatedApiState {
  const options = {
    url,
    params: { offset, limit },
    postpone,
  };
  const [api, refetch] = useDataApi(options, INITIAL_STATE);
  const responseData = Array.isArray(api.data)
    ? { items: api.data, total: api.data.length, offset: 0, limit: -1 }
    : api.data;

  return {
    ...api,
    data: responseData,
    refetch: ({
      offset = INITIAL_STATE.offset,
      limit = INITIAL_STATE.limit,
    } = {}) => {
      refetch({ ...options, params: { offset, limit } });
    },
  };
}
