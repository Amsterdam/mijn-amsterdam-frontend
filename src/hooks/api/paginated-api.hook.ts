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
  postpone: boolean = false,
  method: string = 'GET'
): PaginatedApiState {
  const options = {
    url,
    params: { offset, limit },
    postpone,
    method,
  };
  const [api, refetch] = useDataApi(options, INITIAL_STATE);
  // Basic data formatting
  const data = Array.isArray(api.data)
    ? // API returns array items
      { items: api.data, total: api.data.length, offset: 0, limit: -1 }
    : // API returns paginated api response
    typeof api.data === 'object' && api.data !== null && 'items' in api.data
    ? api.data
    : // API returns unknown data format and defaults to an empty dataset
      { items: [], total: 0, limit: -1 };

  return {
    ...api,
    data,
    refetch: ({
      offset = INITIAL_STATE.offset,
      limit = INITIAL_STATE.limit,
    } = {}) => {
      refetch({ ...options, params: { offset, limit } });
    },
  };
}
