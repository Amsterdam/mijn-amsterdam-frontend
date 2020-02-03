/// <reference types="react-scripts" />

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

type TypeIndex<K extends string, Val> = { [key in K]?: Val };

// TODO: Add typings for this function
declare module 'use-debounce/lib/callback';

type Nullable<T> = T | null;
