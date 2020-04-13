import { MapOptions } from 'leaflet';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  DEFAULT_ZOOM,
} from '../../../universal/config';
import { IS_ACCEPTANCE, IS_PRODUCTION } from '../../../universal/env';
import { getCrsRd } from './MyArea.helpers';

export interface MapDisplayOptions {
  zoomTools: boolean;
  zoom: number;
}

export const DEFAULT_CENTROID: LatLngObject = {
  lng: DEFAULT_LNG,
  lat: DEFAULT_LAT,
};

export const DEFAULT_TILE_LAYER_CONFIG = {
  url: 'https://t{s}.data.amsterdam.nl/topo_rd/{z}/{x}/{y}.png',
  options: {
    subdomains: '1234',
    tms: true,
    detectRetina: true,
  },
};

export const IS_MY_AREA_2_ENABLED = !(IS_PRODUCTION || IS_ACCEPTANCE);

export const DEFAULT_MAP_DISPLAY_CONFIG = {
  zoomTools: true,
  zoom: DEFAULT_ZOOM,
};

export const DEFAULT_MAP_OPTIONS = {
  center: DEFAULT_CENTROID,
  zoom: DEFAULT_ZOOM,
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
