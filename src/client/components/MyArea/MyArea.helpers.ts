import L from 'leaflet';
import {
  DatasetCollection,
  MaPointFeature,
} from '../../../server/services/buurt/datasets';
import { getIconHtml } from './datasets';

export function createClusterDatasetMarkers(datasetGroups: DatasetCollection) {
  return datasetGroups
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
  return L.marker(new L.LatLng(lat, lng), {
    icon,
    properties: {
      datasetItemId: feature.properties.id,
      datasetId: feature.properties.datasetId,
    },
  } as any);
}
