type TypeIndex<K extends string, Val> = { [key in K]: Val };

type Lat = number;
type Lng = number;
type Centroid = [Lng, Lat];
type LatLngObject = { lat: Lat; lng: Lng };

type SessionID = string;
