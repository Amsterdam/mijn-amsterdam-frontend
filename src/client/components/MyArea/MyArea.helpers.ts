import L from 'leaflet';
import {
  DatasetGroup,
  DatasetItemTuple,
} from '../../../server/services/buurt/datasets';
import { Datasets, getIconHtml } from './datasets';

export function createClusterDatasetMarkers(
  datasetGroups: DatasetGroup[]
): Datasets[] {
  return datasetGroups.map((datasetGroup) => {
    return {
      ...datasetGroup,
      collection: Object.fromEntries(
        Object.entries(datasetGroup.collection).map(
          ([datasetId, datasetItems]) => {
            return [
              datasetId,
              datasetItems.map((datasetItemTuple) =>
                createMarker(datasetGroup.id, datasetId, datasetItemTuple)
              ),
            ];
          }
        )
      ),
    };
  });
}

export function createMarker(
  datasetGroupId: string,
  datasetId: string,
  datasetItem: DatasetItemTuple
) {
  const [lat, lng, datasetItemId] = datasetItem;
  const html = getIconHtml(datasetId, datasetGroupId);
  const icon = L.divIcon({
    html,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
  return L.marker(new L.LatLng(lat, lng), {
    icon,
    datasetItemId,
    datasetId,
    datasetGroupId,
  } as any);
}
