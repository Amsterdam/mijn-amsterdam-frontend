import { LatLngTuple } from 'leaflet';

export interface BAGSourceData {
  results: Array<{
    centroid: LatLngTuple;
    adres: string;
    woonplaats: string;
    landelijk_id: string | null;
    [key: string]: any;
  }>;
}
