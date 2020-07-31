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

export interface MapDisplayOptions {
  zoomTools: boolean;
  zoom: number;
}

export const DEFAULT_MAP_DISPLAY_CONFIG: MapDisplayOptions = {
  zoomTools: true,
  zoom: HOOD_ZOOM,
};

export const DEFAULT_TILE_LAYER_CONFIG = {
  url: 'https://t{s}.data.amsterdam.nl/topo_rd/{z}/{x}/{y}.png',
  options: {
    subdomains: '1234',
    tms: true,
    detectRetina: true,
  },
};
