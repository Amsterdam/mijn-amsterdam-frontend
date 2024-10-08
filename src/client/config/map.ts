import L, { LatLng, LatLngLiteral, MapOptions } from 'leaflet';
import proj4, { InterfaceCoordinates } from 'proj4';

import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  HOOD_ZOOM,
} from '../../universal/config/myarea-datasets';

export const projDefinition = `+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,-0.398957,0.343988,-1.87740,4.0725 +units=m +no_defs`;
export const proj4RD = proj4('WGS84', projDefinition);

const MAX_ZOOM = 16;
const ZERO_SCALE = 3440.64;
export function getCrsRd(
  maxZoom = MAX_ZOOM,
  zeroScale = ZERO_SCALE,
  scales: number[] = []
) {
  for (let i = 0; i <= maxZoom; i++) {
    // eslint-disable-next-line no-magic-numbers
    scales.push(1 / (zeroScale * 0.5 ** i));
  }

  return {
    ...L.CRS.Simple,
    ...{
      code: 'EPSG:28992',
      infinite: false,
      projection: {
        project: (latlng: LatLng) => {
          const point = proj4RD.forward([latlng.lng, latlng.lat]);
          return new L.Point(point[0], point[1]);
        },
        unproject: (point: InterfaceCoordinates) => {
          const lnglat = proj4RD.inverse([point.x, point.y]);
          return L.latLng(lnglat[1], lnglat[0]);
        },

        // eslint-disable-next-line no-magic-numbers
        bounds: L.bounds([-285401.92, 903401.92], [595401.92, 22598.08]),

        proj4def: projDefinition,
      },
      // eslint-disable-next-line no-magic-numbers
      transformation: new L.Transformation(1, 285401.92, -1, 903401.92),

      scale: (zoom: number) => {
        if (scales[zoom]) {
          return scales[zoom];
        }
        // eslint-disable-next-line no-magic-numbers
        return 1 / (zeroScale * 0.5 ** zoom);
      },

      // eslint-disable-next-line no-magic-numbers
      zoom: (scale: number) => Math.log(1 / scale / zeroScale) / Math.log(0.5),
    },
  };
}

export const DEFAULT_MAP_OPTIONS = {
  center: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
  zoom: HOOD_ZOOM,
  maxZoom: 16,
  minZoom: 7,
  crs: getCrsRd(),
  zoomControl: false,
  attributionControl: true,
  maxBounds: [
    // eslint-disable-next-line no-magic-numbers
    [52.25168, 4.64034],
    // eslint-disable-next-line no-magic-numbers
    [52.50536, 5.10737],
  ],
  renderer: L.svg({ padding: 10 }),
} as Partial<MapOptions & { center: LatLngLiteral }>;
