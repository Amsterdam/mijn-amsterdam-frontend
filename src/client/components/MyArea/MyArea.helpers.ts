import L, { LatLngBounds, LatLngBoundsLiteral } from 'leaflet';

import type { MaSuperClusterFeature } from '../../../server/services/buurt/datasets.ts';

// Code taken from https://github.com/yagoferrer/marker-spider/blob/master/lib/oms.coffee
const CIRCLE_DIVISION_COUNT = 12;
const twoPi = Math.PI * 2;
const circleFootSeparation = 23;
const circleStartAngle = twoPi / CIRCLE_DIVISION_COUNT;
const spiralLengthStart = 11;
const spiralLengthFactor = 4;
const spiralFootSeparation = 26;

export function pointsCircle(count: number, centerPt: L.Point) {
  const circumference = circleFootSeparation * (2 + count);
  const legLength = circumference / twoPi;
  const angleStep = twoPi / count;
  const points = [];
  let angle = 0;
  let i = 0;
  for (i; i < legLength; i += 1) {
    angle = circleStartAngle + i * angleStep;
    points.push(
      new L.Point(
        centerPt.x + legLength * Math.cos(angle),
        centerPt.y + legLength * Math.sin(angle)
      )
    );
  }
  return points;
}

export function pointsSpiral(count: number, centerPt: L.Point) {
  const points = [];
  let angle = 0;
  let i = 0;
  let legLength = spiralLengthStart;

  for (i; i < legLength; i += 1) {
    // eslint-disable-next-line no-magic-numbers
    angle += spiralFootSeparation / legLength + i * 0.0005;
    const x = centerPt.x + legLength * Math.cos(angle);
    const y = centerPt.y + legLength * Math.sin(angle);
    legLength += (twoPi * spiralLengthFactor) / angle;
    points.push(L.point(x, y));
  }
  return points;
}
// Code

const DECIMAL_PLACES = 6;
export function round(num: number, decimalPlaces: number = DECIMAL_PLACES) {
  const num2 = Math.round((num + 'e' + decimalPlaces) as unknown as number);
  return Number(num2 + 'e' + -decimalPlaces);
}

export function processFeatures(map: L.Map, features: MaSuperClusterFeature[]) {
  const items: Record<string, MaSuperClusterFeature[]> = {};
  const markersFinal: MaSuperClusterFeature[] = [];

  for (const feature of features) {
    if (!feature.properties.cluster) {
      const c = `${round(feature.geometry.coordinates[0])}-${round(
        feature.geometry.coordinates[1]
      )}`;
      if (!items[c]) {
        items[c] = [feature];
      } else {
        items[c].push(feature);
      }
    } else {
      markersFinal.push(feature);
    }
  }

  for (const [, features] of Object.entries(items)) {
    // No point modification needed
    if (features.length === 1) {
      markersFinal.push(features[0]);
    } else {
      const [lng, lat] = features[0].geometry.coordinates;
      const centerPoint = map.latLngToLayerPoint({
        lat,
        lng,
      });
      const featureCount = features.length;
      const MIN_FEATURE_COUNT_FOR_SPIRAL = 11;
      const pts =
        featureCount > MIN_FEATURE_COUNT_FOR_SPIRAL
          ? pointsSpiral(featureCount, centerPoint)
          : pointsCircle(featureCount, centerPoint);

      const modifiedMarkers = pts
        .filter((_, index) => !!features[index])
        .map((pt, index) => {
          const { lng, lat } = map.layerPointToLatLng(pt);
          const feature: MaSuperClusterFeature = {
            ...features[index],
            geometry: {
              coordinates: [lng, lat],
              type: 'Point',
            },
          };
          return feature;
        });
      markersFinal.push(...modifiedMarkers);
    }
  }

  return markersFinal;
}

export function toBoundLiteral(bounds: LatLngBounds): LatLngBoundsLiteral {
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  return [
    [southWest.lat, southWest.lng],
    [northEast.lat, northEast.lng],
  ];
}
