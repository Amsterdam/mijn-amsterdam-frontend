import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  HOOD_ZOOM,
} from '../../universal/config/map';
import { MapOptions } from 'leaflet';
import { getCrsRd } from '../components/MyArea/mapConfig';

export const DEFAULT_MAP_OPTIONS = {
  center: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
  zoom: HOOD_ZOOM,
  maxZoom: 16,
  minZoom: 3,
  crs: getCrsRd(),
  zoomControl: false,
  attributionControl: false,
  maxBounds: [
    [52.25168, 4.64034],
    [52.50536, 5.10737],
  ],
} as Partial<MapOptions>;
