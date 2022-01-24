import { LatLngTuple } from 'leaflet';

export interface BAGSourceData {
  results: Array<{
    centroid: LatLngTuple;
    adres: string;
    woonplaats: string;
    [key: string]: any;
  }>;
}
