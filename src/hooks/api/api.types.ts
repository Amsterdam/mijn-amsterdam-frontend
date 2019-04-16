import { Unshaped } from 'App.types';

export interface ApiRequestOptions {
  url: string;
  params?: Unshaped;
  postpone?: boolean;
}

export interface ApiState {
  isLoading?: boolean;
  isError?: boolean;
  data?: any;
}

export interface ApiHookState extends ApiState {
  isPristine?: boolean;
  isDirty?: boolean;
  refetch?: (options?: ApiRequestOptions | any) => void;
}
