import L from 'leaflet';
import {
  DatasetCollection,
  MaPointFeature,
} from '../../../server/services/buurt/datasets';
import { getIconHtml } from './datasets';

export function createClusterDatasetMarkers(features: DatasetCollection) {
  return features
    .filter(
      (feature): feature is MaPointFeature => feature.geometry.type === 'Point'
    )
    .map((feature) => {
      return createMarker(feature);
    });
}

export function createMarker(feature: MaPointFeature) {
  const html = getIconHtml(feature.properties.datasetId);
  const icon = L.divIcon({
    html,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const [lat, lng] = feature.geometry.coordinates;
  const marker = L.marker(new L.LatLng(lat, lng), {
    icon,
  });
  marker.feature = feature;
  return marker;
}

export function recursiveCoordinateSwap(coords: any) {
  const nCoords = [...coords];
  for (const coord of nCoords) {
    const c1 = coord[0];
    if (typeof c1 !== 'number') {
      recursiveCoordinateSwap(coord);
    } else if (typeof c1 === 'number') {
      coord[0] = coord[1];
      coord[1] = c1;
    }
  }
  return nCoords;
}
