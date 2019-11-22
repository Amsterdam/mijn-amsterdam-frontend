import { Unshaped } from 'App.types';

export interface ApiRequestOptions {
  url: string;
  data?: any;
  params?: Unshaped;
  postpone?: boolean;
  resetToInitialDataOnError?: boolean;
  method?: 'GET' | 'POST';
  timeout?: number; // in ms
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
export type AbortFunction = () => void;
