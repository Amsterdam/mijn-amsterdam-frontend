import { getCrsRd } from 'helpers/geo';
import { MapOptions } from 'leaflet';

export type Lat = number;
export type Lon = number;
export type Centroid = [Lon, Lat];

export const DEFAULT_LAT = 52.3717228;
export const DEFAULT_LON = 4.8927377;
export const DEFAULT_ZOOM = 10;
export const LOCATION_ZOOM = 14;

export const DEFAULT_CENTROID: Centroid = [DEFAULT_LAT, DEFAULT_LON];

export const DEFAULT_MAP_OPTIONS = {
  center: DEFAULT_CENTROID,
  zoom: DEFAULT_ZOOM,
  maxZoom: 16,
  minZoom: 3,
  crs: getCrsRd(),
  maxBounds: [
    [52.25168, 4.64034],
    [52.50536, 5.10737],
  ],
} as Partial<MapOptions>;

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
  'lagen=overig%3A1%7Cverreg%3A1%7Cverbes%3A1%7Cterras%3A1%7Csplits%3A1%7Cspeela%3A1%7Crectif%3A1%7Coptijd%3A1%7Conttre%3A1%7Comgver%3A1%7Cmeldin%3A1%7Cmedede%3A1%7Cligpla%3A1%7Ckapver%3A1%7Cinspra%3A1%7Cexploi%3A1%7Cevever%3A1%7Cdrahor%3A1%7Cbespla%3A1%7Cwlokca%3A1%7Cwlotxtl%3A1%7Cwlopls%3A1%7Cwlogls%3A1%7Cwloppr%3A1%7Cwlorst%3A1%7Ctcevt%3A1%7Cpvg%3A0%7Cuitzpvg%3A0';
