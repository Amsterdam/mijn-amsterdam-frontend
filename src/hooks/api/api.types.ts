import { Unshaped } from 'App.types';

export interface ApiRequestOptions {
  url: string;
  params?: Unshaped;
  postpone?: boolean;
}

export interface ApiState {
  isLoading?: boolean;
  isError?: boolean;
  isPristine?: boolean;
  isDirty?: boolean;
  data?: any;
}
