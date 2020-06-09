// import proj4 from 'proj4';

/**
 * Calculates the haversine distance between point A, and B.
 * @param { lat: number, lng: number } latlngA point A
 * @param { lat: number, lng: number } latlngB point B
 * @param {boolean} isMiles If we are using miles, else km.
 */
export function getApproximateDistance(
  latlngA: LatLngObject,
  latlngB: LatLngObject
) {
  const squared = (x: number) => x * x;
  const toRad = (x: number) => (x * Math.PI) / 180;
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

export const projDefinition = `+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,-0.398957,0.343988,-1.87740,4.0725 +units=m +no_defs'`;
// export const proj4RD = proj4('WGS84', projDefinition);

export function toLatLng([lon, lat]: Centroid): LatLngObject {
  return { lat, lng: lon };
}
