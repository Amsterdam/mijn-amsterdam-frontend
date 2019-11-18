// From: https://gist.githubusercontent.com/mattpowell/3380070/raw/5258f21f807602b699af3463aa684784c59a4443/distance.js
function toRad(n: number) {
  return (n * Math.PI) / 180;
}

export type Lat = number;
export type Lon = number;
export type Centroid = [Lat, Lon];

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
