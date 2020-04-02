import { Centroid, LatLngObject } from '../config/Map.constants';
import L, { LatLng } from 'leaflet';
import proj4, { InterfaceCoordinates } from 'proj4';

/**
 * Calculates the haversine distance between point A, and B.
 * @param {number[]} latlngA [lat, lng] point A
 * @param {number[]} latlngB [lat, lng] point B
 * @param {boolean} isMiles If we are using miles, else km.
 */
export function getDistance(latlngA: Centroid, latlngB: Centroid) {
  const squared = (x: number) => x * x;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth’s mean radius in km

  const dLat = toRad(latlngB[0] - latlngA[0]);
  const dLon = toRad(latlngB[1] - latlngA[1]);

  const dLatSin = squared(Math.sin(dLat / 2));
  const dLonSin = squared(Math.sin(dLon / 2));

  const a =
    dLatSin +
    Math.cos(toRad(latlngA[0])) * Math.cos(toRad(latlngB[0])) * dLonSin;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const projDefinition = `+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,-0.398957,0.343988,-1.87740,4.0725 +units=m +no_defs'`;
const proj4RD = proj4('WGS84', projDefinition);

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

export function toLatLng([lon, lat]: Centroid): LatLngObject {
  return { lat, lng: lon };
}
