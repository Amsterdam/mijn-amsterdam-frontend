import { MapOptions } from 'leaflet';
import { DEFAULT_LAT, DEFAULT_LON } from '../../../universal/config/map';
import { IS_ACCEPTANCE, IS_PRODUCTION } from '../../../universal/env';
import { getCrsRd } from './MyArea.helpers';

export interface MapDisplayOptions {
  zoomTools: boolean;
  zoom: number;
}

export const DEFAULT_ZOOM = 10;
export const LOCATION_ZOOM = 14;

export const DEFAULT_CENTROID: Centroid = [DEFAULT_LON, DEFAULT_LAT];

export const DEFAULT_TILE_LAYER_CONFIG = {
  url: 'https://t{s}.data.amsterdam.nl/topo_rd/{z}/{x}/{y}.png',
  options: {
    subdomains: '1234',
    tms: true,
    detectRetina: true,
  },
};

export const MAP_URL = process.env.REACT_APP_EMBED_MAP_URL;
export const LAYERS_CONFIG =
  'lagen=gembek-overig%3A1%7Cgembek-verreg%3A1%7Cgembek-verbes%3A1%7Cgembek-terras%3A1%7Cgembek-splits%3A1%7Cgembek-speela%3A1%7Cgembek-rectif%3A1%7Cgembek-optijd%3A1%7Cgembek-onttre%3A1%7Cgembek-omgver%3A1%7Cgembek-meldin%3A1%7Cgembek-medede%3A1%7Cgembek-ligpla%3A1%7Cgembek-kapver%3A1%7Cgembek-inspra%3A1%7Cgembek-exploi%3A1%7Cgembek-evever%3A1%7Cgembek-drahor%3A1%7Cgembek-bespla%3A1%7Cafvlc-wlokca%3A1%7Cafvlc-wlotxtl%3A1%7Cafvlc-wlopls%3A1%7Cafvlc-wlogls%3A1%7Cafvlc-wloppr%3A1%7Cafvlc-wlorst%3A1%7Cevnmt-tcevt%3A1%7Cparkrn-pvrgeb%3A0';

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
