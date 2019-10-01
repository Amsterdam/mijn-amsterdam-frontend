import { useDataApi } from './api.hook';
import { ApiRequestOptions, ApiState } from './api.types';

export interface PaginatedApiProps {
  url: string;
  offset?: number;
  limit?: number;
  postpone?: boolean;
  method?: 'GET' | 'POST';
  requestData?: any;
}

export interface PaginatedItemsResponse {
  items: any[];
  total: number;
  offset: number;
  limit: number;
}

export interface PaginatedApiState extends ApiState {
  data: PaginatedItemsResponse;
  rawData: any;
  refetch: (options: {
    offset?: number;
    limit?: number;
    requestData?: any;
  }) => void;
}

export const INITIAL_STATE: PaginatedItemsResponse = {
  items: [],
  total: 0,
  offset: 0,
  limit: 3,
};

export default function usePaginatedApi({
  url,
  requestData,
  offset = INITIAL_STATE.offset,
  limit = INITIAL_STATE.limit,
  postpone = false,
  method = 'GET',
}: PaginatedApiProps): PaginatedApiState {
  const options: ApiRequestOptions = {
    url,
    params: { offset, limit },
    postpone,
    method,
  };

  if (method === 'POST') {
    options.data = requestData;
  }

  const [api, refetch] = useDataApi(options, INITIAL_STATE);
  // Basic data formatting
  const dataFormatted = Array.isArray(api.data)
    ? // API returns array items
      { items: api.data, total: api.data.length, offset: 0, limit: -1 }
    : // API returns paginated api response
    typeof api.data === 'object' && api.data !== null && 'items' in api.data
    ? api.data
    : // API returns unknown data format and defaults to an empty dataset
      { items: [], total: 0, limit: -1 };

  return {
    ...api,
    rawData: api.data,
    data: dataFormatted,
    refetch: ({
      requestData,
      offset = INITIAL_STATE.offset,
      limit = INITIAL_STATE.limit,
    } = {}) => {
      refetch({ ...options, data: requestData, params: { offset, limit } });
    },
  };
}
