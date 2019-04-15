/// <reference types="react-scripts" />

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

// TODO: Add typings for this function
declare module 'use-debounce/lib/callback';
