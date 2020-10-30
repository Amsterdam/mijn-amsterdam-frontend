/// <reference types="react-scripts" />
// TODO: Add typings for this function
declare module 'use-debounce/lib/callback';
declare module 'slugme';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Nullable<T> = T | null;

type Lat = number;
type Lng = number;
type Centroid = [Lng, Lat];
type LatLngObject = { lat: Lat; lng: Lng };

type SessionID = string;

type ResolvedType<T> = T extends PromiseLike<infer U> ? U : T;

type ReturnTypeAsync<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : T extends (...args: any) => infer R
  ? R
  : any;

type ProfileType = 'private' | 'private-commercial' | 'commercial';
