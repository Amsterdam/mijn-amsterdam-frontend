import { Unshaped } from 'App.types';

export interface ApiRequestOptions {
  url: string;
  params?: Unshaped;
  postpone?: boolean;
}

export interface Action {
  type: string;
  payload?: any;
}

export interface ApiData {
  isLoading: boolean;
  isError: boolean;
  data: Unshaped;
}

export interface ApiHook extends ApiData {
  isPristine: boolean;
  isDirty: boolean;
  refetch: (options: ApiRequestOptions) => void;
}
