import { Unshaped } from 'App.types';

export interface ApiRequestOptions {
  url: string;
  data?: any;
  params?: Unshaped;
  postpone?: boolean;
  resetToInitialDataOnError?: boolean;
  method?: 'GET' | 'POST';
}

export interface ApiState {
  isLoading: boolean;
  isError: boolean;
  isPristine: boolean;
  isDirty: boolean;
  data: any;
  errorMessage: string | null;
}

export type RefetchFunction = (options: ApiRequestOptions) => void;
