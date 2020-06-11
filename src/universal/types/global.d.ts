type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

type WithChildren<T, PropsToOmit> = Omit<HTMLProps<T>, PropsToOmit>;

// TODO: Add typings for this function
declare module 'use-debounce/lib/callback';
declare module 'slugme';

type Nullable<T> = T | null;

type Lat = number;
type Lng = number;
type Centroid = [Lng, Lat];
type LatLngObject = { lat: Lat; lng: Lng };

type SessionID = string;

type ResolvedType<T> = T extends PromiseLike<infer U> ? U : T;

type NullableValues<T> = {
  [P in keyof T]: null;
};
