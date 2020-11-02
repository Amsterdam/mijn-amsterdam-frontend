import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  HOOD_ZOOM,
  proj4RD,
  projDefinition,
} from '../../universal/config/buurt';
import L, { LatLng, MapOptions } from 'leaflet';
import { InterfaceCoordinates } from 'proj4';

export function getCrsRd(
  maxZoom = 16,
  zeroScale = 3440.64,
  scales: number[] = []
) {
  for (let i = 0; i <= maxZoom; i++) {
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

        bounds: L.bounds([-285401.92, 903401.92], [595401.92, 22598.08]),

        proj4def: projDefinition,
      },
      transformation: new L.Transformation(1, 285401.92, -1, 903401.92),

      scale: (zoom: number) => {
        if (scales[zoom]) {
          return scales[zoom];
        }
        return 1 / (zeroScale * 0.5 ** zoom);
      },

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
  attributionControl: false,
  maxBounds: [
    [52.25168, 4.64034],
    [52.50536, 5.10737],
  ],
  renderer: L.svg({ padding: 1 }),
} as Partial<MapOptions>;
