import L from 'leaflet';
import {
  DatasetFeatures,
  MaPointFeature,
} from '../../../server/services/buurt/datasets';
import { getIconHtml } from './datasets';

export function createClusterDatasetMarkers(features: DatasetFeatures) {
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
