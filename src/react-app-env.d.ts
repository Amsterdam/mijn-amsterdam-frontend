/// <reference types="react-scripts" />

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

// TODO: Add typings for this function
declare module 'use-debounce/lib/callback';

export function useDebounce(value: any, delay: any, ...args: any[]): any;
export function useDebouncedCallback(
  callback: any,
  delay: any,
  deps: any,
  ...args: any[]
): any;
