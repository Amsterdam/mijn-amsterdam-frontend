import { LatLngTuple } from 'leaflet';

export type BAGSearchResult = {
  centroid: LatLngTuple;
  adres: string;
  woonplaats: string;
  landelijk_id: string | null;
  [key: string]: unknown;
};

export interface BAGSourceData {
  results: BAGSearchResult[];
}
