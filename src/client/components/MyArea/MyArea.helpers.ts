import L from 'leaflet';
import { DatasetItemTuple } from '../../../server/services/buurt/datasets';
import { Datasets, DatasetsSource, getIconHtml } from './datasets';

export function createClusterDatasetMarkers(
  datasetsSources: DatasetsSource[]
): Datasets[] {
  return datasetsSources.map((datasetSource) => {
    return {
      ...datasetSource,
      collection: Object.fromEntries(
        Object.entries(datasetSource.collection).map(
          ([datasetId, datasetItems]) => {
            return [
              datasetId,
              datasetItems.map((datasetItemTuple) =>
                createMarker(datasetSource.id, datasetId, datasetItemTuple)
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
  const html = getIconHtml(datasetId);
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
