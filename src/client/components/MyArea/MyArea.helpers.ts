import { MaSuperClusterFeature } from '../../../server/services/buurt/datasets';
import L from 'leaflet';

// Code taken from https://github.com/yagoferrer/marker-spider/blob/master/lib/oms.coffee
const twoPi = Math.PI * 2;
const circleFootSeparation = 23;
const circleStartAngle = twoPi / 12;
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
    angle += spiralFootSeparation / legLength + i * 0.0005;
    const x = centerPt.x + legLength * Math.cos(angle);
    const y = centerPt.y + legLength * Math.sin(angle);
    legLength += (twoPi * spiralLengthFactor) / angle;
    points.push(L.point(x, y));
  }
  return points;
}
// Code

export function round(num: number, decimalPlaces: number = 6) {
  const num2 = Math.round(((num + 'e' + decimalPlaces) as unknown) as number);
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
      const pts =
        featureCount > 11
          ? pointsSpiral(featureCount, centerPoint)
          : pointsCircle(featureCount, centerPoint);

      const modifiedMarkers = pts
        .filter((pt, index) => !!features[index])
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
