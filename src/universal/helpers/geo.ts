import { LatLngLiteral, LatLngTuple } from 'leaflet';

/**
 * Calculates the haversine distance between point A, and B.
 * @param { lat: number, lng: number } latlngA point A
 * @param { lat: number, lng: number } latlngB point B
 * @param {boolean} isMiles If we are using miles, else km.
 */
export function getApproximateDistance(
  latlngA: LatLngLiteral,
  latlngB: LatLngLiteral
) {
  const degreesToRadians = 180;
  const squared = (x: number) => x * x;
  const toRad = (x: number) => (x * Math.PI) / degreesToRadians;
  const R = 6371; // Earth’s mean radius in km

  const dLat = toRad(latlngB.lng - latlngA.lng);
  const dLon = toRad(latlngB.lat - latlngA.lat);

  const dLatSin = squared(Math.sin(dLat / 2));
  const dLonSin = squared(Math.sin(dLon / 2));

  const a =
    dLatSin +
    Math.cos(toRad(latlngA.lng)) * Math.cos(toRad(latlngB.lng)) * dLonSin;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function toLatLng([lng, lat]: LatLngTuple): LatLngLiteral {
  return { lat, lng };
}
